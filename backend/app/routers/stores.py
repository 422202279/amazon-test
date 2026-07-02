from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.store import Store
from app.serializers import to_dict
from app.services.product_importer import import_internal_store_links, preview_internal_store_links

router = APIRouter(prefix="/stores", tags=["stores"])


@router.get("")
def list_stores(db: Session = Depends(get_db)):
    items = db.query(Store).order_by(Store.platform.asc(), Store.site_code.asc(), Store.name.asc()).all()
    return {"items": [to_dict(item) for item in items]}


@router.get("/import-preview/internal")
def preview_internal_stores(
    path: str = "/Users/jcc_mac/Documents/A新禾亚马逊一部/产品信息汇总表 新系统一些SKU加点版本_在售版本汇总.xlsx",
):
    return {"source": "internal_store_links", "items": preview_internal_store_links(path)}


@router.post("/import/internal")
def import_internal_stores(
    path: str = "/Users/jcc_mac/Documents/A新禾亚马逊一部/产品信息汇总表 新系统一些SKU加点版本_在售版本汇总.xlsx",
    db: Session = Depends(get_db),
):
    result = import_internal_store_links(db, path)
    db.commit()
    return {"source": "internal_store_links", **result}
