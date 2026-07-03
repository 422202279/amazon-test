from pathlib import Path

from sqlalchemy import create_engine, text
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


def ensure_lightweight_migrations() -> None:
    if not settings.database_url.startswith("sqlite:///"):
        return
    migration_map = {
        "supplier_tasks": {
            "suggested_action": "TEXT",
            "actual_rectification": "TEXT",
        },
        "user_accounts": {
            "scope": "VARCHAR(500)",
            "stores_json": "TEXT",
            "status": "VARCHAR(40) DEFAULT '启用'",
            "last_login_at": "DATETIME",
        }
    }
    with engine.begin() as connection:
        for table_name, columns in migration_map.items():
            existing = {
                row[1]
                for row in connection.execute(text(f"PRAGMA table_info({table_name})")).fetchall()
            }
            for column_name, column_type in columns.items():
                if column_name in existing:
                    continue
                connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
