from __future__ import annotations

from collections import Counter

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.review import Review

KNOWN_SITE_CODES = {"US", "CA", "UK", "DE", "FR", "JP", "KR", "EU"}


def validate_product_rows(rows: list[dict]) -> dict:
    issues = []
    for index, row in enumerate(rows, start=1):
        _append_issue(issues, index, "missing_identifier", not any([row.get("asin"), row.get("sku"), row.get("department_item_no")]))
        _append_issue(issues, index, "missing_product_url", not row.get("product_url"))
        _append_issue(issues, index, "missing_title", not row.get("title") or row.get("title") == "未命名产品")
        _append_issue(issues, index, "invalid_rating", _invalid_rating(row.get("rating")))
        _append_issue(issues, index, "negative_monthly_sales", _negative_number(row.get("monthly_sales")))
        _append_issue(issues, index, "negative_review_count", _negative_number(row.get("review_count")))
        _append_issue(issues, index, "unknown_site_code", row.get("site_code") not in KNOWN_SITE_CODES)
    return _summarize_issues(len(rows), issues)


def validate_review_rows(rows: list[dict]) -> dict:
    issues = []
    for index, row in enumerate(rows, start=1):
        _append_issue(issues, index, "missing_review_identifier", not row.get("review_external_id"))
        _append_issue(issues, index, "missing_review_url", not row.get("review_url"))
        _append_issue(issues, index, "missing_review_content", not row.get("review_content"))
        _append_issue(issues, index, "missing_asin", not row.get("asin"))
        _append_issue(issues, index, "invalid_star_rating", _invalid_star_rating(row.get("star_rating")))
        _append_issue(issues, index, "negative_without_issue_category", bool(row.get("is_negative_review")) and not row.get("issue_category"))
        _append_issue(issues, index, "unknown_site_code", row.get("site_code") not in KNOWN_SITE_CODES)
    return _summarize_issues(len(rows), issues)


def build_data_quality_summary(db: Session) -> dict:
    product_total = db.query(func.count(Product.id)).scalar() or 0
    review_total = db.query(func.count(Review.id)).scalar() or 0
    negative_review_total = db.query(func.count(Review.id)).filter(Review.is_negative_review.is_(True)).scalar() or 0

    return {
        "products": {
            "total": product_total,
            "missing_product_url": db.query(func.count(Product.id)).filter(Product.product_url.is_(None)).scalar() or 0,
            "missing_primary_identifier": (
                db.query(func.count(Product.id))
                .filter(Product.asin.is_(None), Product.sku.is_(None), Product.department_item_no.is_(None))
                .scalar()
                or 0
            ),
            "missing_price": db.query(func.count(Product.id)).filter(Product.price_amount.is_(None)).scalar() or 0,
            "missing_review_count": db.query(func.count(Product.id)).filter(Product.review_count.is_(None)).scalar() or 0,
        },
        "reviews": {
            "total": review_total,
            "negative_total": negative_review_total,
            "missing_review_url": db.query(func.count(Review.id)).filter(Review.review_url.is_(None)).scalar() or 0,
            "missing_asin": db.query(func.count(Review.id)).filter(Review.asin.is_(None)).scalar() or 0,
            "missing_issue_category_on_negative": (
                db.query(func.count(Review.id))
                .filter(Review.is_negative_review.is_(True), Review.issue_category.is_(None))
                .scalar()
                or 0
            ),
            "manual_import_count": db.query(func.count(Review.id)).filter(Review.source_type == "manual_import").scalar() or 0,
        },
    }


def _append_issue(issues: list[dict], row_number: int, issue_type: str, condition: bool) -> None:
    if condition:
        issues.append({"row_number": row_number, "issue_type": issue_type})


def _summarize_issues(total_rows: int, issues: list[dict]) -> dict:
    counts = Counter(item["issue_type"] for item in issues)
    sample = issues[:10]
    return {
        "total_rows": total_rows,
        "warning_rows": len({item["row_number"] for item in issues}),
        "issue_counts": dict(counts),
        "sample_issues": sample,
    }


def _invalid_rating(value) -> bool:
    return value is not None and (value < 0 or value > 5)


def _invalid_star_rating(value) -> bool:
    return value is None or value < 1 or value > 5


def _negative_number(value) -> bool:
    return value is not None and value < 0
