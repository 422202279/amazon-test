from fastapi import APIRouter, Depends
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.supplier_task import SupplierTask
from app.serializers import to_dict
from app.services.supplier_tasks import generate_tasks_from_negative_reviews

router = APIRouter(prefix="/supplier-tasks", tags=["supplier-tasks"])


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
