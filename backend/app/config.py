"""アプリケーション設定。"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # 古いローカル .env に残った廃止設定が起動を妨げないよう無視する。
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

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

    ai_timeout_seconds: int = 120

    # AI による献立生成・献立表解析
    ai_provider: str = "gemini"
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4o-mini"
    openai_max_pages: int = 5
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta"


@lru_cache
def get_settings() -> Settings:
    return Settings()
