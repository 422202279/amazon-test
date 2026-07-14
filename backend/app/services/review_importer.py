import json
import re
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path

import pandas as pd
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.review import Review
from app.models.product import Product
from app.services.translation_helper import suggest_cn_summary


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


def preview_reviews_from_workbook(path: str | Path, sheet_name: str | None = None, limit: int = 20, source_file_name: str | None = None) -> list[dict]:
    with pd.ExcelFile(path) as workbook:
        target_sheet = sheet_name or workbook.sheet_names[0]
    df = pd.read_excel(path, sheet_name=target_sheet)
    source_file = source_file_name or Path(path).name
    rows = [normalize_review_row(row, source_file) for _, row in df.head(limit).iterrows()]
    return [asdict(row) for row in rows]


def import_reviews_from_workbook(db: Session, path: str | Path, sheet_name: str | None = None, limit: int = 200, source_file_name: str | None = None) -> dict[str, int]:
    source_file = source_file_name or Path(path).name
    rows = preview_reviews_from_workbook(path, sheet_name, limit, source_file)
    source_asin = _asin_from_filename(source_file)
    source_product = None
    if source_asin:
        source_product = db.execute(select(Product).where(Product.asin == source_asin)).scalar_one_or_none()
    created = 0
    updated = 0
    pending_reviews: dict[tuple[str, str, str | None, str | None], Review] = {}
    for row in rows:
        row["asin"] = row.get("asin") or source_asin
        if source_product:
            row["product_title"] = row.get("product_title") or source_product.title
            row["store_name"] = row.get("store_name") or source_product.store_name
            row["product_url"] = row.get("product_url") or source_product.product_url
            row["site_code"] = row.get("site_code") or source_product.site_code
        review_key = (row["platform"], row["site_code"], row["asin"], row["review_external_id"])
        existing = pending_reviews.get(review_key)
        if existing is None:
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
        pending_reviews[review_key] = review
        created += 1
    # Make this file's rows visible to the next file in a batch before the final transaction commit.
    db.flush()
    return {"created": created, "updated": updated}


def normalize_review_row(row: pd.Series, source_file: str) -> NormalizedReviewRow:
    images_text = _value(row, "评论图片", "图片地址")
    video_url = _value(row, "视频地址")
    has_video = _coerce_bool(_value(row, "是否有视频")) is True
    media_text = video_url if has_video and video_url else images_text
    if has_video and not media_text:
        media_text = "video"
    star_rating = _coerce_int(_value(row, "星级"))
    return NormalizedReviewRow(
        platform=_value(row, "平台") or "Amazon",
        site_code=_value(row, "站点") or _site_from_filename(source_file) or "US",
        store_name=_value(row, "店铺"),
        asin=_value(row, "ASIN"),
        product_title=_value(row, "产品标题", "商品标题"),
        review_external_id=_value(row, "评论ID") or _review_id_from_url(_value(row, "评论链接")),
        review_url=_value(row, "评论链接"),
        product_url=_value(row, "产品链接"),
        star_rating=star_rating,
        review_title=_value(row, "评论标题", "标题"),
        review_content=_value(row, "评论内容", "内容"),
        review_images=media_text,
        reviewer_name=_value(row, "评论人"),
        review_country=_value(row, "评论国家", "所属国家"),
        review_language=_value(row, "评论语言"),
        is_verified_purchase=_coerce_bool(_value(row, "是否Verified Purchase", "VP评论")),
        helpful_count=_coerce_int(_value(row, "点赞数", "赞同数")),
        has_images=bool(images_text or has_video),
        is_negative_review=bool(star_rating and star_rating <= 3),
        issue_category=_value(row, "问题分类") or _infer_issue_category(_value(row, "标题", "评论标题"), _value(row, "内容", "评论内容")),
        sentiment=_value(row, "情绪") or ("负面" if star_rating and star_rating <= 3 else "正面" if star_rating and star_rating >= 4 else "中性"),
        feedback_to_supplier=_coerce_bool(_value(row, "是否反馈供应商")) or False,
        rectification_status=_value(row, "整改状态"),
        source_type="sellersprite_review_export" if "Reviews" in source_file else "manual_import",
        source_file=source_file,
        raw_payload=json.dumps(_normalize_payload(row), ensure_ascii=False),
        reviewed_at=_coerce_datetime(_value(row, "评论时间")),
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
    review.review_summary_cn = row.get("review_summary_cn") or suggest_cn_summary(row.get("review_content"))
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


def _value(row: pd.Series, *keys: str) -> str | None:
    for key in keys:
        value = _safe_text(row.get(key))
        if value is not None:
            return value
    return None


def _site_from_filename(source_file: str) -> str | None:
    match = re.search(r"-(US|UK|DE|JP|CA|FR|KR)-Reviews", source_file, re.I)
    return match.group(1).upper() if match else None


def _asin_from_filename(source_file: str) -> str | None:
    match = re.search(r"([A-Z0-9]{10})-[A-Z]{2}-Reviews", source_file, re.I)
    return match.group(1).upper() if match else None


def _review_id_from_url(url: str | None) -> str | None:
    match = re.search(r"customer-reviews/(?:srp/)?-/([A-Z0-9]+)", url or "", re.I)
    if not match:
        match = re.search(r"customer-reviews/([A-Z0-9]+)", url or "", re.I)
    return match.group(1).upper() if match else None


def _infer_issue_category(title: str | None, content: str | None) -> str:
    text = f"{title or ''} {content or ''}".lower()
    rules = [
        ("质量问题", ("broke", "broken", "quit", "corrod", "quality", "charge", "damaged", "坏", "损坏")),
        ("尺寸问题", ("small", "large", "size", "尺寸")),
        ("异味", ("smell", "odor", "odour", "味")),
        ("包装破损", ("package", "packaging", "box", "包装")),
        ("使用效果差", ("doesn't work", "not work", "weak", "stuck", "效果")),
    ]
    for category, keywords in rules:
        if any(keyword in text for keyword in keywords):
            return category
    return "待分类"


def _normalize_payload(row: pd.Series) -> dict:
    payload = {}
    for key, value in row.to_dict().items():
        if pd.isna(value):
            payload[str(key)] = None
        else:
            payload[str(key)] = value if isinstance(value, (int, float, str, bool)) else str(value)
    return payload
