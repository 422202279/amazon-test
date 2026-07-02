from fastapi import APIRouter

from app.config import settings
from app.schemas import HealthResponse

router = APIRouter(tags=["system"])


@router.get("/health", response_model=HealthResponse)
def healthcheck() -> HealthResponse:
    return HealthResponse(ok=True, app=settings.app_name, env=settings.app_env)
