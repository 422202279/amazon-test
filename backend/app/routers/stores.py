from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.store import Store
from app.models.user_account import UserAccount
from app.serializers import to_dict
from app.security import get_current_user
from app.services.product_importer import import_internal_store_links, preview_internal_store_links

router = APIRouter(prefix="/stores", tags=["stores"])


class StorePayload(BaseModel):
    name: str
    platform: str
    site_code: str
    country_code: str | None = None
    seller_identifier: str | None = None
    store_page_url: str | None = None
    status: str = "active"
    data_source: str | None = None
    notes: str | None = None
    is_enabled: bool = True


@router.get("")
def list_stores(db: Session = Depends(get_db)):
    items = db.query(Store).order_by(Store.platform.asc(), Store.site_code.asc(), Store.name.asc()).all()
    return {"items": [to_dict(item) for item in items]}


@router.post("")
def create_store(
    payload: StorePayload,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    store = Store(**payload.model_dump())
    db.add(store)
    db.commit()
    db.refresh(store)
    return to_dict(store)


@router.put("/{store_id}")
def update_store(
    store_id: int,
    payload: StorePayload,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    store = db.query(Store).filter(Store.id == store_id).one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="店铺不存在")
    for key, value in payload.model_dump().items():
        setattr(store, key, value)
    db.commit()
    db.refresh(store)
    return to_dict(store)


@router.delete("/{store_id}")
def delete_store(
    store_id: int,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    store = db.query(Store).filter(Store.id == store_id).one_or_none()
    if not store:
        raise HTTPException(status_code=404, detail="店铺不存在")
    db.delete(store)
    db.commit()
    return {"ok": True}


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
