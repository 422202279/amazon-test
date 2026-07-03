from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.supplier_task import SupplierTask
from app.models.user_account import UserAccount
from app.serializers import to_dict
from app.security import get_current_user
from app.services.supplier_tasks import generate_tasks_from_negative_reviews

router = APIRouter(prefix="/supplier-tasks", tags=["supplier-tasks"])


class SupplierTaskPayload(BaseModel):
    task_code: str
    asin: str | None = None
    product_title: str | None = None
    supplier_name: str | None = None
    issue_category: str | None = None
    evidence_summary: str | None = None
    status: str = "pending_feedback"
    priority: str = "medium"
    due_date: str | None = None
    suggested_action: str | None = None
    actual_rectification: str | None = None
    notes: str | None = None


@router.get("")
def list_supplier_tasks(
    limit: int = 100,
    offset: int = 0,
    status: str | None = None,
    asin: str | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(SupplierTask)
    if status:
        query = query.filter(SupplierTask.status == status)
    if asin:
        query = query.filter(SupplierTask.asin == asin)
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                SupplierTask.task_code.ilike(like),
                SupplierTask.product_title.ilike(like),
                SupplierTask.supplier_name.ilike(like),
                SupplierTask.issue_category.ilike(like),
                SupplierTask.suggested_action.ilike(like),
                SupplierTask.actual_rectification.ilike(like),
            )
        )
    total = query.count()
    items = query.order_by(SupplierTask.updated_at.desc(), SupplierTask.id.desc()).offset(offset).limit(limit).all()
    return {"items": [to_dict(item) for item in items], "total": total, "offset": offset, "limit": limit}


@router.post("/generate-from-reviews")
def generate_tasks(limit: int = 100, db: Session = Depends(get_db)):
    result = generate_tasks_from_negative_reviews(db, limit)
    db.commit()
    return {"source": "negative_reviews", **result}


@router.post("")
def create_supplier_task(
    payload: SupplierTaskPayload,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    task = SupplierTask(**_normalize_task_payload(payload))
    db.add(task)
    db.commit()
    db.refresh(task)
    return to_dict(task)


@router.put("/{task_id}")
def update_supplier_task(
    task_id: int,
    payload: SupplierTaskPayload,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    task = db.query(SupplierTask).filter(SupplierTask.id == task_id).one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    for key, value in _normalize_task_payload(payload).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return to_dict(task)


@router.delete("/{task_id}")
def delete_supplier_task(
    task_id: int,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    task = db.query(SupplierTask).filter(SupplierTask.id == task_id).one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")
    db.delete(task)
    db.commit()
    return {"ok": True}


def _normalize_task_payload(payload: SupplierTaskPayload) -> dict:
    data = payload.model_dump()
    data["due_date"] = date.fromisoformat(data["due_date"]) if data.get("due_date") else None
    return data
