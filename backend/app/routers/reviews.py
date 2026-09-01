import re
from datetime import datetime, timedelta
from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.review import Review
from app.models.review_capture_job import ReviewCaptureJob
from app.models.supplier_task import SupplierTask
from app.models.user_account import UserAccount
from app.serializers import to_dict
from app.security import get_current_user
from app.services.data_quality import validate_review_rows
from app.services.import_jobs import create_import_job
from app.services.query_helpers import split_identifier_terms
from app.services.review_importer import import_reviews_from_workbook, preview_reviews_from_workbook
from app.services.review_batch_import import mark_capture_jobs_imported
from app.services.translation_helper import suggest_cn_summary

router = APIRouter(prefix="/reviews", tags=["reviews"])

AMAZON_SITE_BY_HOST = {
    "amazon.com": "US", "amazon.ca": "CA", "amazon.co.uk": "UK", "amazon.de": "DE",
    "amazon.fr": "FR", "amazon.co.jp": "JP",
}


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
    review_summary_cn: str | None = None
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


class ReviewCaptureQueuePayload(BaseModel):
    entries: str
    site_code: str | None = None
    store_name: str | None = None


@router.get("/capture-jobs")
def list_review_capture_jobs(
    status: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(ReviewCaptureJob)
    if status:
        query = query.filter(ReviewCaptureJob.status == status)
    jobs = query.order_by(ReviewCaptureJob.updated_at.desc(), ReviewCaptureJob.id.desc()).all()
    return {"items": [to_dict(job) for job in jobs], "total": len(jobs)}


@router.post("/capture-jobs")
def queue_review_captures(
    payload: ReviewCaptureQueuePayload | None = None,
    entries: str | None = None,
    site_code: str | None = None,
    store_name: str | None = None,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    content = payload.entries if payload else entries or ""
    default_site = payload.site_code if payload else site_code
    default_store = payload.store_name if payload else store_name
    created = 0
    duplicate = 0
    invalid: list[str] = []
    for raw_entry in re.split(r"[\s,，;；]+", content.strip()):
        if not raw_entry:
            continue
        asin_match = re.search(r"\b([A-Z0-9]{10})\b", raw_entry.upper())
        if not asin_match:
            invalid.append(raw_entry)
            continue
        asin = asin_match.group(1)
        inferred_site = _infer_amazon_site(raw_entry) or default_site
        existing = db.query(ReviewCaptureJob).filter(
            ReviewCaptureJob.asin == asin,
            ReviewCaptureJob.site_code == inferred_site,
            ReviewCaptureJob.status == "待本机采集",
        ).one_or_none()
        if existing:
            duplicate += 1
            continue
        db.add(ReviewCaptureJob(
            asin=asin,
            product_url=raw_entry if raw_entry.startswith("http") else None,
            site_code=inferred_site,
            store_name=default_store,
        ))
        created += 1
    db.commit()
    return {"created": created, "duplicate": duplicate, "invalid": invalid}


@router.get("")
def list_reviews(
    limit: int = 100,
    offset: int = 0,
    q: str | None = None,
    identifiers: str | None = None,
    platform: str | None = None,
    site_code: str | None = None,
    store_name: str | None = None,
    stars: str | None = None,
    media: str | None = None,
    issue_category: str | None = None,
    feedback: str | None = None,
    period: str | None = None,
    negative_only: bool = False,
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
    if stars == "1-2":
        query = query.filter(Review.star_rating <= 2)
    elif stars == "3":
        query = query.filter(Review.star_rating == 3)
    elif stars == "4-5":
        query = query.filter(Review.star_rating >= 4)
    if media == "with-media":
        query = query.filter(Review.has_images.is_(True))
    elif media == "without-media":
        query = query.filter(Review.has_images.is_(False))
    if issue_category:
        query = query.filter(Review.issue_category == issue_category)
    if feedback == "已反馈":
        query = query.filter(Review.feedback_to_supplier.is_(True))
    elif feedback == "未反馈":
        query = query.filter(Review.feedback_to_supplier.is_(False))
    period_days = {"30d": 30, "60d": 60, "90d": 90, "180d": 180, "365d": 365, "1095d": 1095}.get(period or "")
    if period_days:
        query = query.filter(Review.reviewed_at >= datetime.now() - timedelta(days=period_days))
    if negative_only:
        query = query.filter(Review.is_negative_review.is_(True))
    terms = split_identifier_terms(identifiers)
    if terms:
        query = query.filter(or_(Review.asin.in_(terms), Review.product_title.in_(terms)))
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                Review.review_content.ilike(like),
                Review.review_summary_cn.ilike(like),
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
                    "media_review_count": 0,
                    "star_counts": {str(star): 0 for star in range(1, 6)},
                    "latest_reviewed_at": None,
                    "latest_updated_at": None,
                    "stores": set(),
                    "sites": set(),
                    "source_types": set(),
                    "supplier_task_statuses": set(),
                    "recent_reviews": [],
                },
            )
            bucket["review_count"] += 1
            bucket["negative_review_count"] += 1 if review.is_negative_review else 0
            bucket["media_review_count"] += 1 if review.has_images else 0
            if review.star_rating in range(1, 6):
                bucket["star_counts"][str(review.star_rating)] += 1
            bucket["latest_reviewed_at"] = bucket["latest_reviewed_at"] or to_dict(review).get("reviewed_at")
            bucket["latest_updated_at"] = bucket["latest_updated_at"] or to_dict(review).get("updated_at")
            if review.store_name:
                bucket["stores"].add(review.store_name)
            if review.site_code:
                bucket["sites"].add(review.site_code)
            if review.source_type:
                bucket["source_types"].add(review.source_type)
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
                    "source_types": sorted(bucket["source_types"]),
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
    data["review_summary_cn"] = data.get("review_summary_cn") or suggest_cn_summary(data.get("review_content"))
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
    data["review_summary_cn"] = data.get("review_summary_cn") or suggest_cn_summary(data.get("review_content"))
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
    mark_capture_jobs_imported(db, preview_rows, Path(path).name)
    db.commit()
    return {"source": "generic_review_import", "quality": quality, **result}


@router.post("/upload")
async def upload_reviews(
    file: UploadFile = File(...),
    sheet_name: str | None = None,
    limit: int = 5000,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".xlsx", ".xls"}:
        raise HTTPException(status_code=422, detail="请上传 .xlsx 或 .xls 评论导出文件。")
    with NamedTemporaryFile(suffix=suffix, delete=False) as temp:
        temp.write(await file.read())
        temp_path = Path(temp.name)
    try:
        source_name = file.filename or "uploaded-review-export"
        preview_rows = preview_reviews_from_workbook(temp_path, sheet_name, limit, source_name)
        quality = validate_review_rows(preview_rows)
        result = import_reviews_from_workbook(db, temp_path, sheet_name, limit, source_name)
    finally:
        temp_path.unlink(missing_ok=True)
    create_import_job(
        db,
        import_type="uploaded_review_export",
        source_name=file.filename or "uploaded-review-export",
        total_rows=quality["total_rows"],
        success_rows=result["created"] + result["updated"],
        warning_rows=quality["warning_rows"],
        issue_summary=quality,
    )
    mark_capture_jobs_imported(db, preview_rows, source_name)
    db.commit()
    return {"source": "uploaded_review_export", "quality": quality, **result}


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


def _infer_amazon_site(entry: str) -> str | None:
    host_match = re.search(r"amazon\.(com\.br|com\.mx|co\.uk|co\.jp|com|ca|de|fr)", entry.lower())
    if not host_match:
        return None
    return AMAZON_SITE_BY_HOST.get(f"amazon.{host_match.group(1)}")
