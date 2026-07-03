import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.import_job import ImportJob
from app.serializers import to_dict
from app.services.data_quality import build_data_quality_summary

router = APIRouter(prefix="/ops", tags=["ops"])


@router.get("/import-jobs")
def list_import_jobs(limit: int = 50, db: Session = Depends(get_db)):
    items = db.query(ImportJob).order_by(ImportJob.created_at.desc(), ImportJob.id.desc()).limit(limit).all()
    payload = []
    for item in items:
        data = to_dict(item)
        if item.error_summary:
            try:
                data["error_summary"] = json.loads(item.error_summary)
            except json.JSONDecodeError:
                pass
        payload.append(data)
    return {"items": payload}


@router.get("/data-quality")
def data_quality_summary(db: Session = Depends(get_db)):
    return build_data_quality_summary(db)


@router.get("/schedule-settings")
def schedule_settings():
    return {
        "default_times": [item.strip() for item in settings.default_schedule_times.split(",") if item.strip()],
        "max_schedule_times": settings.max_schedule_times,
        "recommended_strategy": "daily_low_frequency",
        "notes": "最低配云服务器建议默认每天 06:00 跑一次，可额外自定义 1~2 个时间点。",
    }


@router.post("/manual-refresh")
def manual_refresh(target: str, source_mode: str = "standard"):
    return {
        "status": "queued",
        "target": target,
        "source_mode": source_mode,
        "message": "原型阶段先返回任务已加入队列，后续接入真实后台任务执行器。",
    }
