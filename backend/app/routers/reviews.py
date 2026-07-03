from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.review import Review
from app.models.supplier_task import SupplierTask
from app.models.user_account import UserAccount
from app.serializers import to_dict
from app.security import get_current_user
from app.services.data_quality import validate_review_rows
from app.services.import_jobs import create_import_job
from app.services.query_helpers import split_identifier_terms
from app.services.review_importer import import_reviews_from_workbook, preview_reviews_from_workbook

router = APIRouter(prefix="/reviews", tags=["reviews"])


class ReviewPayload(BaseModel):
    platform: str
    site_code: str
    store_name: str | None = None
    asin: str | None = None
    product_title: str | None = None
    review_external_id: str | None = None
    review_url: str | None = None
    product_url: str | None = None
    star_rating: int | None = None
    review_title: str | None = None
    review_content: str | None = None
    review_images: str | None = None
    reviewer_name: str | None = None
    review_country: str | None = None
    review_language: str | None = None
    is_verified_purchase: bool | None = None
    helpful_count: int | None = None
    has_images: bool = False
    is_negative_review: bool = False
    issue_category: str | None = None
    sentiment: str | None = None
    feedback_to_supplier: bool = False
    rectification_status: str | None = None
    source_type: str | None = None
    reviewed_at: str | None = None


@router.get("")
def list_reviews(
    limit: int = 100,
    offset: int = 0,
    q: str | None = None,
    identifiers: str | None = None,
    platform: str | None = None,
    site_code: str | None = None,
    store_name: str | None = None,
    view_mode: str = "timeline",
    db: Session = Depends(get_db),
):
    query = db.query(Review)
    if platform:
        query = query.filter(Review.platform == platform)
    if site_code:
        query = query.filter(Review.site_code == site_code)
    if store_name:
        query = query.filter(Review.store_name == store_name)
    terms = split_identifier_terms(identifiers)
    if terms:
        query = query.filter(or_(Review.asin.in_(terms), Review.product_title.in_(terms)))
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                Review.review_content.ilike(like),
                Review.review_title.ilike(like),
                Review.product_title.ilike(like),
                Review.asin.ilike(like),
                Review.reviewer_name.ilike(like),
            )
        )

    ordered = query.order_by(Review.reviewed_at.desc(), Review.id.desc())
    total = query.count()
    all_items = ordered.all() if view_mode == "product" else None
    page_items = ordered.offset(offset).limit(limit).all() if view_mode != "product" else all_items or []

    task_items = db.query(SupplierTask).order_by(SupplierTask.updated_at.desc(), SupplierTask.id.desc()).all()
    task_map = {}
    for task in task_items:
        key = (task.asin, task.issue_category)
        task_map.setdefault(key, task)

    if view_mode == "product":
        grouped: dict[tuple[str | None, str | None], dict] = {}
        for review in page_items:
            key = (review.asin, review.product_title)
            task = task_map.get((review.asin, review.issue_category))
            bucket = grouped.setdefault(
                key,
                {
                    "asin": review.asin,
                    "product_title": review.product_title,
                    "review_count": 0,
                    "negative_review_count": 0,
                    "latest_reviewed_at": None,
                    "stores": set(),
                    "sites": set(),
                    "supplier_task_statuses": set(),
                    "recent_reviews": [],
                },
            )
            bucket["review_count"] += 1
            bucket["negative_review_count"] += 1 if review.is_negative_review else 0
            bucket["latest_reviewed_at"] = bucket["latest_reviewed_at"] or to_dict(review).get("reviewed_at")
            if review.store_name:
                bucket["stores"].add(review.store_name)
            if review.site_code:
                bucket["sites"].add(review.site_code)
            if task and task.status:
                bucket["supplier_task_statuses"].add(task.status)
            if len(bucket["recent_reviews"]) < 3:
                bucket["recent_reviews"].append(_serialize_review(review, task))
        items = []
        for bucket in grouped.values():
            items.append(
                {
                    **bucket,
                    "stores": sorted(bucket["stores"]),
                    "sites": sorted(bucket["sites"]),
                    "supplier_task_statuses": sorted(bucket["supplier_task_statuses"]),
                }
            )
        items.sort(key=lambda item: item["latest_reviewed_at"] or "", reverse=True)
        return {"items": items[:limit], "total": total, "group_count": len(items), "view_mode": view_mode}

    items = [_serialize_review(review, task_map.get((review.asin, review.issue_category))) for review in page_items]
    return {"items": items, "total": total, "offset": offset, "limit": limit, "view_mode": view_mode}


@router.post("")
def create_review(
    payload: ReviewPayload,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    data = payload.model_dump()
    data["reviewed_at"] = _parse_datetime(data.get("reviewed_at"))
    review = Review(**data)
    db.add(review)
    db.commit()
    db.refresh(review)
    return to_dict(review)


@router.put("/{review_id}")
def update_review(
    review_id: int,
    payload: ReviewPayload,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    review = db.query(Review).filter(Review.id == review_id).one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="评论不存在")
    data = payload.model_dump()
    data["reviewed_at"] = _parse_datetime(data.get("reviewed_at"))
    for key, value in data.items():
        setattr(review, key, value)
    db.commit()
    db.refresh(review)
    return to_dict(review)


@router.delete("/{review_id}")
def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    review = db.query(Review).filter(Review.id == review_id).one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="评论不存在")
    db.delete(review)
    db.commit()
    return {"ok": True}


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


def _serialize_review(review: Review, task: SupplierTask | None) -> dict:
    data = to_dict(review)
    data["supplier_task_code"] = task.task_code if task else None
    data["supplier_task_status"] = task.status if task else None
    data["supplier_task_priority"] = task.priority if task else None
    data["supplier_name"] = task.supplier_name if task else None
    data["supplier_task_suggested_action"] = task.suggested_action if task else None
    data["supplier_task_actual_rectification"] = task.actual_rectification if task else None
    data["supplier_task_notes"] = task.notes if task else None
    return data


def _parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace(" ", "T"))
