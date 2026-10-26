"""アプリケーション設定。"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "Hoiku-Recipe API"
    version: str = "0.1.0"
    database_url: str = f"sqlite:///{BACKEND_DIR / 'hoiku_recipe.db'}"
    jwt_secret_key: str = "change-me-in-production-0123456789abcdef0123456789abcdef"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    cors_origins: list[str] = ["http://localhost:3000"]

    # レート制限（ログイン・登録へのブルートフォース対策）
    rate_limit_enabled: bool = True
    rate_limit_max_requests: int = 5
    rate_limit_window_seconds: int = 60

    # AI 献立生成（Xiaomi MiMo / OpenAI 互換 API）
    ai_base_url: str = "https://api.xiaomimimo.com/v1"
    ai_model: str = "mimo-v2.6-pro"
    ai_api_key: str = ""
    ai_timeout_seconds: int = 120

    # 献立表の AI 読み取り（マルチモーダル）
    # 空なら ai_model を使用する。画像入力に対応したモデルを指定する。
    ai_ocr_model: str = "mimo-v2.6-flash"
    ai_ocr_max_pages: int = 5

    # OpenAI 献立表解析（設定時はこちらを優先）
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_ocr_model: str = "gpt-4o-mini"


@lru_cache
def get_settings() -> Settings:
    return Settings()
