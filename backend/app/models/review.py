from datetime import UTC, datetime

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    platform: Mapped[str] = mapped_column(String(40), index=True)
    site_code: Mapped[str] = mapped_column(String(20), index=True)
    store_name: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    asin: Mapped[str | None] = mapped_column(String(40), nullable=True, index=True)
    product_title: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    review_external_id: Mapped[str | None] = mapped_column(String(120), nullable=True, index=True)
    review_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    product_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    star_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    review_title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    review_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    review_images: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewer_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    review_country: Mapped[str | None] = mapped_column(String(60), nullable=True)
    review_language: Mapped[str | None] = mapped_column(String(60), nullable=True)
    is_verified_purchase: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    helpful_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    has_images: Mapped[bool] = mapped_column(Boolean, default=False)
    is_negative_review: Mapped[bool] = mapped_column(Boolean, default=False)
    issue_category: Mapped[str | None] = mapped_column(String(120), nullable=True)
    sentiment: Mapped[str | None] = mapped_column(String(40), nullable=True)
    feedback_to_supplier: Mapped[bool] = mapped_column(Boolean, default=False)
    rectification_status: Mapped[str | None] = mapped_column(String(40), nullable=True)
    source_type: Mapped[str | None] = mapped_column(String(40), nullable=True)
    source_file: Mapped[str | None] = mapped_column(String(255), nullable=True)
    raw_payload: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))
