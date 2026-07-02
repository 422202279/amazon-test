from datetime import UTC, date, datetime

from sqlalchemy import Date, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    platform: Mapped[str] = mapped_column(String(40), index=True)
    site_code: Mapped[str] = mapped_column(String(20), index=True)
    store_name: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    department_item_no: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    sku: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    asin: Mapped[str | None] = mapped_column(String(40), nullable=True, index=True)
    parent_asin: Mapped[str | None] = mapped_column(String(40), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(1000))
    brand: Mapped[str | None] = mapped_column(String(120), nullable=True)
    category_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    category_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    product_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    price_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    price_currency: Mapped[str | None] = mapped_column(String(10), nullable=True)
    monthly_sales: Mapped[int | None] = mapped_column(Integer, nullable=True)
    monthly_revenue: Mapped[float | None] = mapped_column(Float, nullable=True)
    review_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rating: Mapped[float | None] = mapped_column(Float, nullable=True)
    qa_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    variation_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    seller_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    buybox_seller: Mapped[str | None] = mapped_column(String(120), nullable=True)
    fulfillment_type: Mapped[str | None] = mapped_column(String(40), nullable=True)
    launch_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    keyword_total: Mapped[int | None] = mapped_column(Integer, nullable=True)
    keyword_organic: Mapped[int | None] = mapped_column(Integer, nullable=True)
    keyword_ads: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bsr_main: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bsr_sub: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weight_text: Mapped[str | None] = mapped_column(String(120), nullable=True)
    size_text: Mapped[str | None] = mapped_column(String(200), nullable=True)
    package_weight_text: Mapped[str | None] = mapped_column(String(120), nullable=True)
    package_size_text: Mapped[str | None] = mapped_column(String(200), nullable=True)
    supplier_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    supplier_factory: Mapped[str | None] = mapped_column(String(200), nullable=True)
    status: Mapped[str | None] = mapped_column(String(40), nullable=True)
    source_file: Mapped[str | None] = mapped_column(String(255), nullable=True)
    raw_payload: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))
