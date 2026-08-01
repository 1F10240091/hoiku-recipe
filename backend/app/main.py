"""FastAPI エントリポイント。"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.routers import auth, children, menus, recipes, shopping

settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, version=settings.version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(children.router, prefix="/api/v1")
app.include_router(menus.router, prefix="/api/v1")
app.include_router(recipes.router, prefix="/api/v1")
app.include_router(shopping.router, prefix="/api/v1")


@app.get("/health", tags=["health"])
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}
