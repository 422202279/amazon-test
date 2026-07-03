import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

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
