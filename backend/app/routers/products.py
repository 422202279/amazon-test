from fastapi import APIRouter

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.serializers import to_dict
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
    return {"source": "internal_store_products", "items": preview_internal_store_products(path, limit)}


@router.get("/import-preview/sellersprite")
def preview_sellersprite_products_endpoint(
    path: str = "/Users/jcc_mac/Downloads/Product-CA-20260702.xlsx",
    limit: int = 10,
    sheet_name: str | None = None,
):
    return {"source": "sellersprite_products", "items": preview_sellersprite_products(path, sheet_name, limit)}


@router.post("/import/internal")
def import_internal_products(
    path: str = "/Users/jcc_mac/Documents/A新禾亚马逊一部/产品信息汇总表 新系统一些SKU加点版本_在售版本汇总.xlsx",
    limit: int = 200,
    db: Session = Depends(get_db),
):
    result = import_internal_store_products(db, path, limit)
    db.commit()
    return {"source": "internal_store_products", **result}


@router.post("/import/sellersprite")
def import_sellersprite_products_endpoint(
    path: str = "/Users/jcc_mac/Downloads/Product-CA-20260702.xlsx",
    limit: int = 200,
    sheet_name: str | None = None,
    db: Session = Depends(get_db),
):
    result = import_sellersprite_products(db, path, limit, sheet_name)
    db.commit()
    return {"source": "sellersprite_products", **result}
