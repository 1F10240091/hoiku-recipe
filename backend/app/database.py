"""データベース接続設定。"""

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import get_settings

settings = get_settings()

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def migrate_recipe_columns() -> None:
    """既存SQLite DBへレシピ拡張列を安全に追加する。"""
    if not settings.database_url.startswith("sqlite"):
        return
    columns = {c["name"] for c in inspect(engine).get_columns("recipes")}
    additions = {
        "cuisine": "VARCHAR(20) NOT NULL DEFAULT '和'",
        "age_min_months": "INTEGER NOT NULL DEFAULT 12",
        "age_max_months": "INTEGER NOT NULL DEFAULT 72",
        "is_official": "BOOLEAN NOT NULL DEFAULT 1",
        "owner_id": "VARCHAR(36)",
        "is_public": "BOOLEAN NOT NULL DEFAULT 0",
    }
    with engine.begin() as connection:
        for name, definition in additions.items():
            if name not in columns:
                connection.execute(text(f"ALTER TABLE recipes ADD COLUMN {name} {definition}"))
