from datetime import UTC, datetime

from sqlalchemy import DateTime, Float, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ProductMetricHistory(Base):
    __tablename__ = "product_metric_history"
    __table_args__ = (
        UniqueConstraint(
            "platform",
            "site_code",
            "metric_type",
            "metric_month",
            "asin",
            name="uq_product_metric_month",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    platform: Mapped[str] = mapped_column(String(40), index=True)
    site_code: Mapped[str] = mapped_column(String(20), index=True)
    metric_type: Mapped[str] = mapped_column(String(60), index=True)
    metric_month: Mapped[str] = mapped_column(String(20), index=True)
    asin: Mapped[str | None] = mapped_column(String(40), nullable=True, index=True)
    sku: Mapped[str | None] = mapped_column(String(120), nullable=True)
    parent_asin: Mapped[str | None] = mapped_column(String(40), nullable=True)
    title: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    product_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    metric_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    source_file: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))
