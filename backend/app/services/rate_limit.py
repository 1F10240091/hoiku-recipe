"""Atomic shared request budgets for serverless production workers."""
import hashlib
import hmac
import time
from sqlalchemy import case, delete
from sqlalchemy.dialects.postgresql import insert
from app.database import engine
from app.models import RateLimitBucket


def consume_budget(client_key: str, path: str, secret: str, max_requests: int, window_seconds: int) -> bool:
    window = int(time.time()) // window_seconds
    key = hmac.new(secret.encode(), f"{client_key}:{path}".encode(), hashlib.sha256).hexdigest()
    table = RateLimitBucket.__table__
    statement = insert(table).values(key=key, window=window, hits=1)
    statement = statement.on_conflict_do_update(index_elements=[table.c.key], set_={
        "window": window,
        "hits": case((table.c.window == window, table.c.hits + 1), else_=1),
    }).returning(table.c.hits)
    with engine.begin() as connection:
        # Bounded retention; no raw IPs are stored.
        connection.execute(delete(table).where(table.c.window < window - 2))
        hits = connection.execute(statement).scalar_one()
    return hits <= max_requests
