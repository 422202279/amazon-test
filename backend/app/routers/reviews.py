from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.review import Review
from app.serializers import to_dict
from app.services.review_importer import import_reviews_from_workbook, preview_reviews_from_workbook

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("")
def list_reviews(limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(Review).order_by(Review.reviewed_at.desc(), Review.id.desc()).limit(limit).all()
    return {"items": [to_dict(item) for item in items]}


@router.get("/import-preview")
def preview_reviews(
    path: str,
    sheet_name: str | None = None,
    limit: int = 20,
):
    return {"source": "generic_review_import", "items": preview_reviews_from_workbook(path, sheet_name, limit)}


@router.post("/import")
def import_reviews(
    path: str,
    sheet_name: str | None = None,
    limit: int = 200,
    db: Session = Depends(get_db),
):
    result = import_reviews_from_workbook(db, path, sheet_name, limit)
    db.commit()
    return {"source": "generic_review_import", **result}
