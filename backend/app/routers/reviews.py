from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.review import Review
from app.serializers import to_dict
from app.services.data_quality import validate_review_rows
from app.services.import_jobs import create_import_job
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
    items = preview_reviews_from_workbook(path, sheet_name, limit)
    return {"source": "generic_review_import", "items": items, "quality": validate_review_rows(items)}


@router.post("/import")
def import_reviews(
    path: str,
    sheet_name: str | None = None,
    limit: int = 200,
    db: Session = Depends(get_db),
):
    preview_rows = preview_reviews_from_workbook(path, sheet_name, limit)
    quality = validate_review_rows(preview_rows)
    result = import_reviews_from_workbook(db, path, sheet_name, limit)
    create_import_job(
        db,
        import_type="generic_review_import",
        source_name=path,
        total_rows=quality["total_rows"],
        success_rows=result["created"] + result["updated"],
        warning_rows=quality["warning_rows"],
        issue_summary=quality,
    )
    db.commit()
    return {"source": "generic_review_import", "quality": quality, **result}
