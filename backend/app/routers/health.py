from fastapi import APIRouter
from pathlib import Path

from app.config import settings, sqlite_path_from_url
from app.schemas import HealthResponse

router = APIRouter(tags=["system"])


@router.get("/health", response_model=HealthResponse)
def healthcheck() -> HealthResponse:
    return HealthResponse(ok=True, app=settings.app_name, env=settings.app_env)


@router.get("/health/detail")
def health_detail():
    database_path = sqlite_path_from_url(settings.database_url)
    database_exists = Path(database_path).exists() if database_path else False
    settings.export_dir.mkdir(parents=True, exist_ok=True)
    settings.backup_dir.mkdir(parents=True, exist_ok=True)
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    return {
        "ok": True,
        "app": settings.app_name,
        "env": settings.app_env,
        "database_url": settings.database_url,
        "database_path": str(database_path) if database_path else None,
        "database_exists": database_exists,
        "upload_dir": str(settings.upload_dir),
        "export_dir": str(settings.export_dir),
        "backup_dir": str(settings.backup_dir),
    }
