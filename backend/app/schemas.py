from datetime import date, datetime

from pydantic import BaseModel


class HealthResponse(BaseModel):
    ok: bool
    app: str
    env: str


class ProductImportPreviewRow(BaseModel):
    platform: str
    site_code: str
    store_name: str | None = None
    department_item_no: str | None = None
    sku: str | None = None
    asin: str | None = None
    parent_asin: str | None = None
    title: str
    category_name: str | None = None
    product_url: str | None = None
    image_url: str | None = None
    price_amount: float | None = None
    price_currency: str | None = None
    monthly_sales: int | None = None
    monthly_revenue: float | None = None
    review_count: int | None = None
    rating: float | None = None
    variation_count: int | None = None
    seller_count: int | None = None
    buybox_seller: str | None = None
    launch_date: date | None = None
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
    source_file: str | None = None


class ProductRead(ProductImportPreviewRow):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
