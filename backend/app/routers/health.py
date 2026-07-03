from fastapi import APIRouter
from pathlib import Path

from app.config import settings
from app.schemas import HealthResponse

router = APIRouter(tags=["system"])


@router.get("/health", response_model=HealthResponse)
def healthcheck() -> HealthResponse:
    return HealthResponse(ok=True, app=settings.app_name, env=settings.app_env)


@router.get("/health/detail")
def health_detail():
    database_exists = False
    database_path = None
    if settings.database_url.startswith("sqlite:///./"):
        database_path = settings.database_url.removeprefix("sqlite:///./")
        database_exists = Path(database_path).exists()
    settings.export_dir.mkdir(parents=True, exist_ok=True)
    settings.backup_dir.mkdir(parents=True, exist_ok=True)
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    return {
        "ok": True,
        "app": settings.app_name,
        "env": settings.app_env,
        "database_url": settings.database_url,
        "database_path": database_path,
        "database_exists": database_exists,
        "upload_dir": str(settings.upload_dir),
        "export_dir": str(settings.export_dir),
        "backup_dir": str(settings.backup_dir),
    }
