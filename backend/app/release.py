"""Run once per deployment: python -m app.release."""
from pathlib import Path
from alembic import command
from alembic.config import Config
from app.database import SessionLocal
from app.services.seed import seed_recipes

def main():
    config = Config(str(Path(__file__).resolve().parent.parent / "alembic.ini"))
    command.upgrade(config, "head")
    with SessionLocal() as db:
        seed_recipes(db)

if __name__ == "__main__":
    main()
