from __future__ import annotations

from collections import Counter

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.review import Review
from app.models.store import Store

KNOWN_SITE_CODES = {"US", "CA", "UK", "DE", "FR", "JP", "KR", "EU"}
EXPECTED_STORES_BY_SITE = {
    "US": ["美国新店", "美国老店"],
    "UK": ["英国-新店", "英国-老店"],
    "DE": ["德国新店", "德国老店"],
    "JP": ["日本站"],
    "KR": ["韩国 COUPANG", "韩国 NAVER"],
    "CA": ["加拿大店"],
    "FR": ["法国店"],
}
SITE_REASON_HINTS = {
    "US": "已有内部产品表来源，可继续补链接级字段。",
    "UK": "已有内部产品表来源，可继续补链接级字段。",
    "DE": "已有内部产品表来源，可继续补链接级字段。",
    "JP": "已有内部产品表来源，可继续补评论与趋势维度。",
    "CA": "当前主要来自卖家精灵导出文件，可稳定补产品字段。",
    "FR": "当前本地未发现法国站源文件，不能伪造数据，需补导出表或店铺清单。",
    "KR": "当前缺少稳定公开数据链路，建议人工导入或卖家侧 API/后台导出。",
}


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
    store_total = db.query(func.count(Store.id)).scalar() or 0
    products = db.query(Product).all()
    reviews = db.query(Review).all()
    stores = db.query(Store).all()

    return {
        "stores": {
            "total": store_total,
            "expected_total": sum(len(items) for items in EXPECTED_STORES_BY_SITE.values()),
            "coverage": _build_store_coverage(stores),
        },
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
            "coverage": _build_product_coverage(products),
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
            "coverage": _build_review_coverage(reviews),
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


def _build_store_coverage(stores: list[Store]) -> dict:
    site_items = []
    actual_counts = Counter(store.site_code or "UNKNOWN" for store in stores if store.site_code)
    actual_names: dict[str, set[str]] = {}
    for store in stores:
        if not store.site_code:
            continue
        actual_names.setdefault(store.site_code, set()).add(store.name)

    for site_code, expected_names in EXPECTED_STORES_BY_SITE.items():
        current_names = sorted(actual_names.get(site_code, set()))
        site_items.append(
            {
                "site_code": site_code,
                "expected_count": len(expected_names),
                "actual_count": actual_counts.get(site_code, 0),
                "expected_names": expected_names,
                "actual_names": current_names,
                "missing_names": [name for name in expected_names if name not in current_names]
                if actual_counts.get(site_code, 0) < len(expected_names)
                else [],
                "status": "complete" if actual_counts.get(site_code, 0) >= len(expected_names) else "partial",
                "reason": SITE_REASON_HINTS.get(site_code, "待继续核对来源。"),
            }
        )

    extras = []
    for site_code in sorted(actual_counts):
        if site_code not in EXPECTED_STORES_BY_SITE:
            extras.append({"site_code": site_code, "count": actual_counts[site_code]})

    return {
        "sites": site_items,
        "missing_site_codes": [item["site_code"] for item in site_items if item["actual_count"] == 0],
        "extra_sites": extras,
    }


def _build_product_coverage(products: list[Product]) -> dict:
    by_site = {}
    for product in products:
        site_code = product.site_code or "UNKNOWN"
        bucket = by_site.setdefault(
            site_code,
            {
                "site_code": site_code,
                "count": 0,
                "with_title": 0,
                "with_image": 0,
                "with_category": 0,
                "with_brand": 0,
                "with_price": 0,
                "with_rating": 0,
                "with_review_count": 0,
                "with_monthly_sales": 0,
                "with_monthly_revenue": 0,
                "with_bsr_main": 0,
                "with_bsr_sub": 0,
                "with_variation_count": 0,
                "with_bullets_or_description": 0,
                "last_updated_at": None,
            },
        )
        bucket["count"] += 1
        bucket["with_title"] += _filled(product.title) and "待补标题" not in (product.title or "")
        bucket["with_image"] += _filled(product.image_url)
        bucket["with_category"] += _filled(product.category_name) or _filled(product.category_path)
        bucket["with_brand"] += _filled(product.brand)
        bucket["with_price"] += product.price_amount is not None
        bucket["with_rating"] += product.rating is not None
        bucket["with_review_count"] += product.review_count is not None
        bucket["with_monthly_sales"] += product.monthly_sales is not None
        bucket["with_monthly_revenue"] += product.monthly_revenue is not None
        bucket["with_bsr_main"] += product.bsr_main is not None
        bucket["with_bsr_sub"] += product.bsr_sub is not None
        bucket["with_variation_count"] += product.variation_count is not None
        bucket["with_bullets_or_description"] += _payload_has_listing_detail(product.raw_payload)
        bucket["last_updated_at"] = _max_timestamp(bucket["last_updated_at"], product.updated_at)

    items = []
    for site_code in EXPECTED_STORES_BY_SITE:
        bucket = by_site.get(site_code)
        if not bucket:
            items.append(
                {
                    "site_code": site_code,
                    "count": 0,
                    "status": "missing",
                    "reason": SITE_REASON_HINTS.get(site_code, "待继续核对来源。"),
                    "last_updated_at": None,
                }
            )
            continue
        bucket["status"] = "complete" if bucket["count"] else "missing"
        bucket["reason"] = SITE_REASON_HINTS.get(site_code, "待继续核对来源。")
        items.append(bucket)

    return {
        "sites": items,
        "missing_site_codes": [item["site_code"] for item in items if item["count"] == 0],
    }


def _build_review_coverage(reviews: list[Review]) -> dict:
    by_site = {}
    for review in reviews:
        site_code = review.site_code or "UNKNOWN"
        bucket = by_site.setdefault(
            site_code,
            {
                "site_code": site_code,
                "count": 0,
                "negative_count": 0,
                "newly_added_count": 0,
                "with_content": 0,
                "with_review_url": 0,
                "with_country": 0,
                "with_reviewer": 0,
                "with_images": 0,
                "last_updated_at": None,
            },
        )
        bucket["count"] += 1
        bucket["negative_count"] += bool(review.is_negative_review)
        bucket["newly_added_count"] += 1 if review.created_at and review.reviewed_at and review.created_at.date() == review.reviewed_at.date() else 0
        bucket["with_content"] += _filled(review.review_content)
        bucket["with_review_url"] += _filled(review.review_url)
        bucket["with_country"] += _filled(review.review_country)
        bucket["with_reviewer"] += _filled(review.reviewer_name)
        bucket["with_images"] += bool(review.has_images or review.review_images)
        bucket["last_updated_at"] = _max_timestamp(bucket["last_updated_at"], review.updated_at)

    items = []
    for site_code in EXPECTED_STORES_BY_SITE:
        bucket = by_site.get(site_code)
        if not bucket:
            items.append(
                {
                    "site_code": site_code,
                    "count": 0,
                    "status": "missing",
                    "reason": SITE_REASON_HINTS.get(site_code, "待继续核对来源。"),
                    "last_updated_at": None,
                }
            )
            continue
        bucket["status"] = "complete" if bucket["count"] else "missing"
        bucket["reason"] = SITE_REASON_HINTS.get(site_code, "待继续核对来源。")
        items.append(bucket)

    return {
        "sites": items,
        "missing_site_codes": [item["site_code"] for item in items if item["count"] == 0],
    }


def _filled(value) -> bool:
    return value not in (None, "", [])


def _max_timestamp(current, candidate):
    if current is None:
        return candidate.isoformat() if candidate else None
    if not candidate:
        return current
    return max(current, candidate.isoformat())


def _payload_has_listing_detail(raw_payload: str | None) -> bool:
    if not raw_payload:
        return False
    return any(
        token in raw_payload
        for token in ["五点", "bullet", "描述", "description", "要点", "卖点"]
    )
