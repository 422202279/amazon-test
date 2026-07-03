from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product_metric import ProductMetricHistory
from app.serializers import to_dict
from app.services.import_jobs import create_import_job
from app.services.product_importer import import_sellersprite_sales_history, preview_sellersprite_sales_history

router = APIRouter(prefix="/metrics", tags=["metrics"])


@router.get("")
def list_metrics(limit: int = 100, db: Session = Depends(get_db)):
    items = (
        db.query(ProductMetricHistory)
        .order_by(ProductMetricHistory.metric_month.desc(), ProductMetricHistory.metric_type.asc())
        .limit(limit)
        .all()
    )
    return {"items": [to_dict(item) for item in items]}


@router.get("/import-preview/sales-history")
def preview_sales_history(
    path: str = "/Users/jcc_mac/Downloads/product-CA-sales-20260702-71124.xlsx",
    limit: int = 20,
):
    return {"source": "sellersprite_sales_history", "items": preview_sellersprite_sales_history(path, limit)}


@router.post("/import/sales-history")
def import_sales_history(
    path: str = "/Users/jcc_mac/Downloads/product-CA-sales-20260702-71124.xlsx",
    limit: int = 200,
    db: Session = Depends(get_db),
):
    preview_rows = preview_sellersprite_sales_history(path, limit)
    result = import_sellersprite_sales_history(db, path, limit)
    create_import_job(
        db,
        import_type="sellersprite_sales_history",
        source_name=path,
        total_rows=len(preview_rows),
        success_rows=result["created"] + result["updated"],
    )
    db.commit()
    return {"source": "sellersprite_sales_history", **result}
