"""アプリケーション設定。"""

import ipaddress
from functools import lru_cache
from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # 古いローカル .env に残った廃止設定が起動を妨げないよう無視する。
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    environment: Literal["development", "production"] = "development"
    app_name: str = "Hoiku-Recipe API"
    version: str = "0.1.0"
    database_url: str = f"sqlite:///{BACKEND_DIR / 'hoiku_recipe.db'}"
    jwt_secret_key: str = "change-me-in-production-0123456789abcdef0123456789abcdef"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    trusted_proxy_ips: list[str] = []

    # レート制限（ログイン・登録へのブルートフォース対策）
    rate_limit_enabled: bool = True
    rate_limit_max_requests: int = 5
    rate_limit_window_seconds: int = 60

    ai_timeout_seconds: int = 120

    # 献立表解析
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.5-flash-lite"
    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta"
    gemini_max_pages: int = 5

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.environment != "production":
            return self

        weak_markers = ("change-me", "development", "example", "replace", "placeholder")
        if len(self.jwt_secret_key) < 32 or any(marker in self.jwt_secret_key.lower() for marker in weak_markers):
            raise ValueError("本番環境では32文字以上のJWT_SECRET_KEYを設定してください")
        if make_url(self.database_url).get_backend_name() != "postgresql":
            raise ValueError("本番環境では永続化されたPostgreSQL DATABASE_URLを設定してください")
        invalid_origins = []
        for origin in self.cors_origins:
            parsed = urlsplit(origin)
            if (
                parsed.scheme != "https"
                or not parsed.hostname
                or parsed.hostname.lower() in {"localhost", "127.0.0.1", "::1"}
                or parsed.path
                or parsed.query
                or parsed.fragment
                or "*" in origin
            ):
                invalid_origins.append(origin)
        if not self.cors_origins or invalid_origins:
            raise ValueError("本番環境のCORS_ORIGINSにはHTTPSの公開フロントエンドURLを設定してください")
        if not self.rate_limit_enabled:
            raise ValueError("本番環境ではRATE_LIMIT_ENABLED=trueにしてください")
        for proxy_ip in self.trusted_proxy_ips:
            ipaddress.ip_address(proxy_ip)
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
