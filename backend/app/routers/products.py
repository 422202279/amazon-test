from fastapi import APIRouter

from app.services.product_importer import preview_internal_store_products, preview_sellersprite_products

router = APIRouter(prefix="/products", tags=["products"])


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
