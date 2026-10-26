"""レート制限ミドルウェア。

ログイン試行などの認証関連エンドポイントを IP ごとに制限する。
プロセス内のインメモリ実装のため、複数プロセス構成では不正確になるが、
学内・学祭向けアプリとしては十分な抑止力となる。
"""

import time
from collections import defaultdict, deque
from typing import Callable

from starlette.applications import Starlette
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.base import Request, Response
from starlette.responses import JSONResponse


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: Starlette, max_requests: int = 5, window_seconds: int = 60) -> None:
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, deque] = defaultdict(deque)

    def _client_key(self, request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def dispatch(self, request: Request, call_next: Callable[[Request], Response]) -> Response:
        path = request.url.path
        # レート制限を適用するエンドポイント
        limited_paths = {"/api/v1/auth/login", "/api/v1/auth/register"}
        if path not in limited_paths:
            response = await call_next(request)
            return _security_headers(response)

        key = f"{self._client_key(request)}:{path}"
        now = time.monotonic()
        hits = self._hits[key]

        # ウィンドウ外の古い記録を除去
        while hits and now - hits[0] > self.window_seconds:
            hits.popleft()

        if len(hits) >= self.max_requests:
            return _security_headers(JSONResponse(
                status_code=429,
                content={"detail": "試行回数が多すぎます。しばらく待ってから再度お試しください。"},
            ))

        # 失敗した試行だけを数える。ログイン成功や登録成功で枠を消費しないため、
        # 学内など同じ IP を共有する環境でもデモ中に 429 になりにくい。
        response = await call_next(request)
        if response.status_code in {400, 401, 403, 422}:
            hits.append(now)
        return _security_headers(response)


def _security_headers(response: Response) -> Response:
    """ブラウザ側の基本的な防御ヘッダーを付与する。"""
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    return response
