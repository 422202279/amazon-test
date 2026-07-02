from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.supplier_task import SupplierTask
from app.serializers import to_dict
from app.services.supplier_tasks import generate_tasks_from_negative_reviews

router = APIRouter(prefix="/supplier-tasks", tags=["supplier-tasks"])


@router.get("")
def list_supplier_tasks(limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(SupplierTask).order_by(SupplierTask.updated_at.desc(), SupplierTask.id.desc()).limit(limit).all()
    return {"items": [to_dict(item) for item in items]}


@router.post("/generate-from-reviews")
def generate_tasks(limit: int = 100, db: Session = Depends(get_db)):
    result = generate_tasks_from_negative_reviews(db, limit)
    db.commit()
    return {"source": "negative_reviews", **result}
