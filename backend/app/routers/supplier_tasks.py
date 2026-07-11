from datetime import date, datetime
from pathlib import Path
from tempfile import NamedTemporaryFile

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
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


@router.post("/import")
async def import_supplier_tasks(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".xlsx", ".xls"}:
        raise HTTPException(status_code=422, detail="请上传 .xlsx 或 .xls 整改任务模板。")
    with NamedTemporaryFile(suffix=suffix, delete=False) as temp:
        temp.write(await file.read())
        temp_path = Path(temp.name)
    try:
        frame = pd.read_excel(temp_path)
    finally:
        temp_path.unlink(missing_ok=True)

    created = 0
    updated = 0
    for index, row in frame.iterrows():
        asin = _cell(row, "ASIN")
        product_title = _cell(row, "产品标题")
        if not asin or not product_title:
            continue
        task_code = _cell(row, "任务编号") or _generated_task_code(asin, index + 1)
        data = {
            "task_code": task_code,
            "asin": asin,
            "product_title": product_title,
            "supplier_name": _cell(row, "供应商") or "待补供应商",
            "issue_category": _cell(row, "问题分类") or "待分类",
            "evidence_summary": _cell(row, "证据摘要"),
            "suggested_action": _cell(row, "建议方案"),
            "actual_rectification": _cell(row, "实际整改"),
            "priority": _priority_value(_cell(row, "优先级")),
            "status": _status_value(_cell(row, "状态")),
            "due_date": _date_value(_cell(row, "截止日期")),
            "notes": _cell(row, "备注"),
        }
        existing = db.query(SupplierTask).filter(SupplierTask.task_code == task_code).one_or_none()
        if existing:
            for key, value in data.items():
                setattr(existing, key, value)
            updated += 1
        else:
            db.add(SupplierTask(**data))
            created += 1
    db.commit()
    return {"source": "supplier_task_template", "created": created, "updated": updated}


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


def _cell(row: pd.Series, key: str) -> str | None:
    value = row.get(key)
    if value is None or pd.isna(value):
        return None
    text = str(value).strip()
    return text or None


def _generated_task_code(asin: str, row_number: int) -> str:
    return f"SR-{datetime.now().strftime('%y%m%d')}-{asin[-6:]}-{row_number:03d}"


def _priority_value(value: str | None) -> str:
    return {"高": "high", "中": "medium", "低": "low", "high": "high", "low": "low"}.get((value or "").lower(), "medium")


def _status_value(value: str | None) -> str:
    return {"待反馈": "pending_feedback", "处理中": "in_progress", "观察中": "observing", "已整改": "resolved"}.get(value or "", "pending_feedback")


def _date_value(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return pd.to_datetime(value).date()
    except (TypeError, ValueError):
        return None
