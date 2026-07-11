from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import case, func, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.models.review import Review
from app.models.user_account import UserAccount
from app.serializers import to_dict
from app.security import get_current_user
from app.services.data_quality import validate_product_rows
from app.services.import_jobs import create_import_job
from app.services.product_importer import (
    import_internal_store_products,
    import_sellersprite_products,
    preview_internal_store_products,
    preview_sellersprite_products,
)
from app.services.query_helpers import split_identifier_terms
from app.services.translation_helper import suggest_cn_title

router = APIRouter(prefix="/products", tags=["products"])

PRODUCT_DATA_FIELDS = (
    "department_item_no", "asin", "sku", "parent_asin", "title", "localized_title", "brand",
    "category_name", "category_path", "product_url", "image_url", "price_amount", "price_currency",
    "monthly_sales", "monthly_revenue", "review_count", "rating", "qa_count", "variation_count",
    "seller_count", "buybox_seller", "fulfillment_type", "launch_date", "keyword_total",
    "keyword_organic", "keyword_ads", "bsr_main", "bsr_sub", "weight_text", "size_text",
    "package_weight_text", "package_size_text", "supplier_name", "supplier_factory", "status",
)


class ProductPayload(BaseModel):
    platform: str
    site_code: str
    store_name: str | None = None
    department_item_no: str | None = None
    sku: str | None = None
    asin: str | None = None
    parent_asin: str | None = None
    title: str
    localized_title: str | None = None
    brand: str | None = None
    category_path: str | None = None
    category_name: str | None = None
    product_url: str | None = None
    image_url: str | None = None
    price_amount: float | None = None
    price_currency: str | None = None
    monthly_sales: int | None = None
    monthly_revenue: float | None = None
    review_count: int | None = None
    rating: float | None = None
    qa_count: int | None = None
    variation_count: int | None = None
    seller_count: int | None = None
    buybox_seller: str | None = None
    fulfillment_type: str | None = None
    keyword_total: int | None = None
    keyword_organic: int | None = None
    keyword_ads: int | None = None
    bsr_main: int | None = None
    bsr_sub: int | None = None
    weight_text: str | None = None
    size_text: str | None = None
    package_weight_text: str | None = None
    package_size_text: str | None = None
    supplier_name: str | None = None
    supplier_factory: str | None = None
    status: str | None = None


def _serialize_product(product: Product) -> dict:
    payload = to_dict(product)
    source = product.source_file or "人工维护"
    field_availability = {}
    for field_name in PRODUCT_DATA_FIELDS:
        value = getattr(product, field_name)
        available = value is not None and value != ""
        field_availability[field_name] = {
            "available": available,
            "source": source,
            "reason": None if available else "当前导入来源未提供该字段",
        }
    payload["field_availability"] = field_availability
    payload["data_completeness"] = {
        "available_fields": sum(1 for item in field_availability.values() if item["available"]),
        "tracked_fields": len(field_availability),
        "source": source,
        "updated_at": payload.get("updated_at"),
    }
    return payload


@router.get("")
def list_products(
    limit: int = 100,
    offset: int = 0,
    q: str | None = None,
    identifiers: str | None = None,
    platform: str | None = None,
    site_code: str | None = None,
    store_name: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if platform:
        query = query.filter(Product.platform == platform)
    if site_code:
        query = query.filter(Product.site_code == site_code)
    if store_name:
        query = query.filter(Product.store_name == store_name)
    terms = split_identifier_terms(identifiers)
    if terms:
        query = query.filter(
            or_(
                Product.asin.in_(terms),
                Product.parent_asin.in_(terms),
                Product.sku.in_(terms),
                Product.department_item_no.in_(terms),
            )
        )
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                Product.title.ilike(like),
                Product.localized_title.ilike(like),
                Product.brand.ilike(like),
                Product.asin.ilike(like),
                Product.parent_asin.ilike(like),
                Product.sku.ilike(like),
                Product.department_item_no.ilike(like),
            )
        )
    total = query.count()
    items = query.order_by(Product.updated_at.desc(), Product.id.desc()).offset(offset).limit(limit).all()
    return {"items": [_serialize_product(item) for item in items], "total": total, "offset": offset, "limit": limit}


@router.post("")
def create_product(
    payload: ProductPayload,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    data = payload.model_dump()
    data["localized_title"] = data.get("localized_title") or suggest_cn_title(data.get("title"))
    product = Product(**data)
    db.add(product)
    db.commit()
    db.refresh(product)
    return to_dict(product)


@router.put("/{product_id}")
def update_product(
    product_id: int,
    payload: ProductPayload,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="产品不存在")
    data = payload.model_dump()
    data["localized_title"] = data.get("localized_title") or suggest_cn_title(data.get("title"))
    for key, value in data.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return to_dict(product)


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="产品不存在")
    db.delete(product)
    db.commit()
    return {"ok": True}


@router.get("/compare")
def compare_products(
    parent_asin: str | None = None,
    asins: str | None = None,
    skus: str | None = None,
    identifiers: str | None = None,
    platform: str | None = None,
    site_code: str | None = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if platform:
        query = query.filter(Product.platform == platform)
    if site_code:
        query = query.filter(Product.site_code == site_code)

    asin_terms = split_identifier_terms(asins)
    sku_terms = split_identifier_terms(skus)
    mixed_terms = split_identifier_terms(identifiers)
    filters = []
    if parent_asin:
        filters.append(Product.parent_asin == parent_asin)
    if asin_terms:
        filters.append(Product.asin.in_(asin_terms))
    if sku_terms:
        filters.append(Product.sku.in_(sku_terms))
    if mixed_terms:
        filters.append(
            or_(
                Product.parent_asin.in_(mixed_terms),
                Product.asin.in_(mixed_terms),
                Product.sku.in_(mixed_terms),
                Product.department_item_no.in_(mixed_terms),
            )
        )
    if filters:
        query = query.filter(or_(*filters))

    items = query.order_by(Product.store_name.asc(), Product.site_code.asc(), Product.id.desc()).limit(limit).all()
    asin_list = [item.asin for item in items if item.asin]
    review_stats = {
        row.asin: row
        for row in (
            db.query(
                Review.asin.label("asin"),
                func.count(Review.id).label("review_total"),
                func.sum(case((Review.is_negative_review.is_(True), 1), else_=0)).label("negative_total"),
                func.sum(case((Review.has_images.is_(True), 1), else_=0)).label("image_total"),
            )
            .filter(Review.asin.in_(asin_list) if asin_list else False)
            .group_by(Review.asin)
            .all()
        )
    }
    issue_rows = (
        db.query(
            Review.asin.label("asin"),
            Review.issue_category.label("issue_category"),
            func.count(Review.id).label("issue_total"),
        )
        .filter(Review.asin.in_(asin_list) if asin_list else False)
        .group_by(Review.asin, Review.issue_category)
        .all()
    )
    issue_stats: dict[str, list[tuple[str, int]]] = {}
    for row in issue_rows:
        if not row.asin or not row.issue_category:
            continue
        issue_stats.setdefault(row.asin, []).append((row.issue_category, int(row.issue_total or 0)))

    payload = []
    for item in items:
        stats = review_stats.get(item.asin)
        has_review_evidence = stats is not None
        negative_total = int(stats.negative_total or 0) if has_review_evidence else None
        review_total = int(stats.review_total or 0) if has_review_evidence else (item.review_count or 0)
        top_issues = " / ".join(
            issue
            for issue, _ in sorted(issue_stats.get(item.asin, []), key=lambda pair: pair[1], reverse=True)[:3]
        )
        payload.append(
            {
                **_serialize_product(item),
                "recent_sales": item.monthly_sales,
                "recent_revenue": item.monthly_revenue,
                "review_total": review_total,
                "negative_review_total": negative_total,
                "negative_ratio": round((negative_total / review_total) * 100, 2) if has_review_evidence and review_total else None,
                "image_review_total": int(stats.image_total or 0) if has_review_evidence else None,
                "top_issue_summary": top_issues or None if has_review_evidence else None,
                "review_data_status": "available" if has_review_evidence else "missing",
            }
        )
    return {
        "items": payload,
        "matched_count": len(payload),
        "supported_periods": ["all", "30d", "60d", "90d", "180d", "365d", "1095d"],
        "notes": "当前销量字段以导入源的近30天快照为主，多周期销量需结合历史表进一步计算。",
    }


@router.get("/import-preview/internal")
def preview_internal_products(
    path: str = "/Users/jcc_mac/Documents/A新禾亚马逊一部/产品信息汇总表 新系统一些SKU加点版本_在售版本汇总.xlsx",
    limit: int = 10,
):
    items = preview_internal_store_products(path, limit)
    return {"source": "internal_store_products", "items": items, "quality": validate_product_rows(items)}


@router.get("/import-preview/sellersprite")
def preview_sellersprite_products_endpoint(
    path: str = "/Users/jcc_mac/Downloads/Product-CA-20260702.xlsx",
    limit: int = 10,
    sheet_name: str | None = None,
):
    items = preview_sellersprite_products(path, sheet_name, limit)
    return {"source": "sellersprite_products", "items": items, "quality": validate_product_rows(items)}


@router.post("/import/internal")
def import_internal_products(
    path: str = "/Users/jcc_mac/Documents/A新禾亚马逊一部/产品信息汇总表 新系统一些SKU加点版本_在售版本汇总.xlsx",
    limit: int = 200,
    db: Session = Depends(get_db),
):
    preview_rows = preview_internal_store_products(path, limit)
    quality = validate_product_rows(preview_rows)
    result = import_internal_store_products(db, path, limit)
    create_import_job(
        db,
        import_type="internal_store_products",
        source_name=path,
        total_rows=quality["total_rows"],
        success_rows=result["created"] + result["updated"],
        warning_rows=quality["warning_rows"],
        issue_summary=quality,
    )
    db.commit()
    return {"source": "internal_store_products", "quality": quality, **result}


@router.post("/import/sellersprite")
def import_sellersprite_products_endpoint(
    path: str = "/Users/jcc_mac/Downloads/Product-CA-20260702.xlsx",
    limit: int = 200,
    sheet_name: str | None = None,
    db: Session = Depends(get_db),
):
    preview_rows = preview_sellersprite_products(path, sheet_name, limit)
    quality = validate_product_rows(preview_rows)
    result = import_sellersprite_products(db, path, limit, sheet_name)
    create_import_job(
        db,
        import_type="sellersprite_products",
        source_name=path,
        total_rows=quality["total_rows"],
        success_rows=result["created"] + result["updated"],
        warning_rows=quality["warning_rows"],
        issue_summary=quality,
    )
    db.commit()
    return {"source": "sellersprite_products", "quality": quality, **result}
