import json
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path

import pandas as pd
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.review import Review


@dataclass
class NormalizedReviewRow:
    platform: str
    site_code: str
    store_name: str | None
    asin: str | None
    product_title: str | None
    review_external_id: str | None
    review_url: str | None
    product_url: str | None
    star_rating: int | None
    review_title: str | None
    review_content: str | None
    review_images: str | None
    reviewer_name: str | None
    review_country: str | None
    review_language: str | None
    is_verified_purchase: bool | None
    helpful_count: int | None
    has_images: bool
    is_negative_review: bool
    issue_category: str | None
    sentiment: str | None
    feedback_to_supplier: bool
    rectification_status: str | None
    source_type: str | None
    source_file: str | None
    raw_payload: str | None
    reviewed_at: datetime | None


def preview_reviews_from_workbook(path: str | Path, sheet_name: str | None = None, limit: int = 20) -> list[dict]:
    with pd.ExcelFile(path) as workbook:
        target_sheet = sheet_name or workbook.sheet_names[0]
    df = pd.read_excel(path, sheet_name=target_sheet)
    rows = [normalize_review_row(row, Path(path).name) for _, row in df.head(limit).iterrows()]
    return [asdict(row) for row in rows]


def import_reviews_from_workbook(db: Session, path: str | Path, sheet_name: str | None = None, limit: int = 200) -> dict[str, int]:
    rows = preview_reviews_from_workbook(path, sheet_name, limit)
    created = 0
    updated = 0
    for row in rows:
        existing = db.execute(
            select(Review).where(
                Review.platform == row["platform"],
                Review.site_code == row["site_code"],
                Review.review_external_id == row["review_external_id"],
                Review.asin == row["asin"],
            )
        ).scalar_one_or_none()
        if existing:
            _apply_review_row(existing, row)
            updated += 1
            continue
        review = Review(platform=row["platform"], site_code=row["site_code"])
        _apply_review_row(review, row)
        db.add(review)
        created += 1
    return {"created": created, "updated": updated}


def normalize_review_row(row: pd.Series, source_file: str) -> NormalizedReviewRow:
    images_text = _safe_text(row.get("评论图片"))
    star_rating = _coerce_int(row.get("星级"))
    return NormalizedReviewRow(
        platform=_safe_text(row.get("平台")) or "Amazon",
        site_code=_safe_text(row.get("站点")) or "US",
        store_name=_safe_text(row.get("店铺")),
        asin=_safe_text(row.get("ASIN")),
        product_title=_safe_text(row.get("产品标题")),
        review_external_id=_safe_text(row.get("评论ID")),
        review_url=_safe_text(row.get("评论链接")),
        product_url=_safe_text(row.get("产品链接")),
        star_rating=star_rating,
        review_title=_safe_text(row.get("评论标题")),
        review_content=_safe_text(row.get("评论内容")),
        review_images=images_text,
        reviewer_name=_safe_text(row.get("评论人")),
        review_country=_safe_text(row.get("评论国家")),
        review_language=_safe_text(row.get("评论语言")),
        is_verified_purchase=_coerce_bool(row.get("是否Verified Purchase")),
        helpful_count=_coerce_int(row.get("点赞数")),
        has_images=bool(images_text),
        is_negative_review=bool(star_rating and star_rating <= 3),
        issue_category=_safe_text(row.get("问题分类")),
        sentiment=_safe_text(row.get("情绪")),
        feedback_to_supplier=_coerce_bool(row.get("是否反馈供应商")) or False,
        rectification_status=_safe_text(row.get("整改状态")),
        source_type="manual_import",
        source_file=source_file,
        raw_payload=json.dumps(_normalize_payload(row), ensure_ascii=False),
        reviewed_at=_coerce_datetime(row.get("评论时间")),
    )


def _apply_review_row(review: Review, row: dict) -> None:
    review.store_name = row.get("store_name")
    review.asin = row.get("asin")
    review.product_title = row.get("product_title")
    review.review_external_id = row.get("review_external_id")
    review.review_url = row.get("review_url")
    review.product_url = row.get("product_url")
    review.star_rating = row.get("star_rating")
    review.review_title = row.get("review_title")
    review.review_content = row.get("review_content")
    review.review_images = row.get("review_images")
    review.reviewer_name = row.get("reviewer_name")
    review.review_country = row.get("review_country")
    review.review_language = row.get("review_language")
    review.is_verified_purchase = row.get("is_verified_purchase")
    review.helpful_count = row.get("helpful_count")
    review.has_images = row.get("has_images")
    review.is_negative_review = row.get("is_negative_review")
    review.issue_category = row.get("issue_category")
    review.sentiment = row.get("sentiment")
    review.feedback_to_supplier = row.get("feedback_to_supplier")
    review.rectification_status = row.get("rectification_status")
    review.source_type = row.get("source_type")
    review.source_file = row.get("source_file")
    review.raw_payload = row.get("raw_payload")
    review.reviewed_at = row.get("reviewed_at")


def _coerce_bool(value) -> bool | None:
    if pd.isna(value):
        return None
    text = str(value).strip().lower()
    if text in {"y", "yes", "true", "1", "是"}:
        return True
    if text in {"n", "no", "false", "0", "否"}:
        return False
    return None


def _coerce_int(value) -> int | None:
    if pd.isna(value):
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def _coerce_datetime(value) -> datetime | None:
    if pd.isna(value):
        return None
    try:
        return pd.to_datetime(value).to_pydatetime()
    except (TypeError, ValueError):
        return None


def _safe_text(value) -> str | None:
    if pd.isna(value):
        return None
    text = str(value).strip()
    return text or None


def _normalize_payload(row: pd.Series) -> dict:
    payload = {}
    for key, value in row.to_dict().items():
        if pd.isna(value):
            payload[str(key)] = None
        else:
            payload[str(key)] = value if isinstance(value, (int, float, str, bool)) else str(value)
    return payload
