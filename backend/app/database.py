"""データベース接続設定。"""

from sqlalchemy import create_engine, event, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import get_settings

settings = get_settings()
database_url = settings.database_url
if database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)
connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
engine = create_engine(database_url, connect_args=connect_args, pool_pre_ping=True, **({"pool_size": 2, "max_overflow": 1, "pool_recycle": 120, "pool_timeout": 10} if settings.environment == "production" else {}))
if database_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def enable_foreign_keys(connection, _record):
        connection.execute("PRAGMA foreign_keys=ON")

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
        "source_name": "VARCHAR(120)",
        "source_url": "VARCHAR(500)",
        "servings_note": "VARCHAR(160)",
        "child_notes": "TEXT",
        "is_official": "BOOLEAN NOT NULL DEFAULT 1",
        "owner_id": "VARCHAR(36)",
        "is_public": "BOOLEAN NOT NULL DEFAULT 0",
    }
    with engine.begin() as connection:
        for name, definition in additions.items():
            if name not in columns:
                connection.execute(text(f"ALTER TABLE recipes ADD COLUMN {name} {definition}"))
