from fastapi import APIRouter

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.serializers import to_dict
from app.services.data_quality import validate_product_rows
from app.services.import_jobs import create_import_job
from app.services.product_importer import (
    import_internal_store_products,
    import_sellersprite_products,
    preview_internal_store_products,
    preview_sellersprite_products,
)

router = APIRouter(prefix="/products", tags=["products"])


@router.get("")
def list_products(limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(Product).order_by(Product.updated_at.desc()).limit(limit).all()
    return {"items": [to_dict(item) for item in items]}


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
