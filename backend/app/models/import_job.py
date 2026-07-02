from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ImportJob(Base):
    __tablename__ = "import_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    import_type: Mapped[str] = mapped_column(String(80), index=True)
    source_name: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(40), default="pending")
    total_rows: Mapped[int | None] = mapped_column(Integer, nullable=True)
    success_rows: Mapped[int | None] = mapped_column(Integer, nullable=True)
    failed_rows: Mapped[int | None] = mapped_column(Integer, nullable=True)
    error_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
