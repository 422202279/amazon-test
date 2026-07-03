from datetime import UTC, date, datetime

from sqlalchemy import Date, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class SupplierTask(Base):
    __tablename__ = "supplier_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    task_code: Mapped[str] = mapped_column(String(80), index=True, unique=True)
    asin: Mapped[str | None] = mapped_column(String(40), nullable=True, index=True)
    product_title: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    supplier_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    issue_category: Mapped[str | None] = mapped_column(String(120), nullable=True)
    evidence_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="pending_feedback")
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    suggested_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    actual_rectification: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))
