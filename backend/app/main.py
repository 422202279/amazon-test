from fastapi import FastAPI

from app.config import settings
from app.database import Base, engine
from app.routers.health import router as health_router
from app.routers.metrics import router as metrics_router
from app.routers.products import router as products_router
from app.routers.stores import router as stores_router


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    Base.metadata.create_all(bind=engine)
    app.include_router(health_router, prefix=settings.api_prefix)
    app.include_router(stores_router, prefix=settings.api_prefix)
    app.include_router(products_router, prefix=settings.api_prefix)
    app.include_router(metrics_router, prefix=settings.api_prefix)
    return app
