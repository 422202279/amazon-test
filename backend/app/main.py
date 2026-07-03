from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine, ensure_lightweight_migrations
from app.routers.admin import router as admin_router
from app.routers.auth import router as auth_router
from app.routers.health import router as health_router
from app.routers.metrics import router as metrics_router
from app.routers.ops import router as ops_router
from app.routers.products import router as products_router
from app.routers.reviews import router as reviews_router
from app.routers.stores import router as stores_router
from app.routers.supplier_tasks import router as supplier_tasks_router
from app.security import ensure_default_admin
from app.database import SessionLocal


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    Base.metadata.create_all(bind=engine)
    ensure_lightweight_migrations()
    with SessionLocal() as db:
        ensure_default_admin(db)
    app.include_router(health_router, prefix=settings.api_prefix)
    app.include_router(auth_router, prefix=settings.api_prefix)
    app.include_router(stores_router, prefix=settings.api_prefix)
    app.include_router(products_router, prefix=settings.api_prefix)
    app.include_router(reviews_router, prefix=settings.api_prefix)
    app.include_router(supplier_tasks_router, prefix=settings.api_prefix)
    app.include_router(metrics_router, prefix=settings.api_prefix)
    app.include_router(ops_router, prefix=settings.api_prefix)
    app.include_router(admin_router, prefix=settings.api_prefix)
    return app
