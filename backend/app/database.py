from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    pass


def _ensure_sqlite_parent() -> None:
    if settings.database_url.startswith("sqlite:///./"):
        relative_path = settings.database_url.removeprefix("sqlite:///./")
        Path(relative_path).parent.mkdir(parents=True, exist_ok=True)


_ensure_sqlite_parent()

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
