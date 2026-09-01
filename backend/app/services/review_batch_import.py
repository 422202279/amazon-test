import re
from datetime import UTC, datetime
from pathlib import Path

from sqlalchemy.orm import Session

from app.models.review_capture_job import ReviewCaptureJob
from app.services.review_importer import import_reviews_from_workbook, preview_reviews_from_workbook


def find_sellersprite_review_exports(directory: str | Path) -> list[Path]:
    root = Path(directory).expanduser()
    if not root.exists() or not root.is_dir():
        return []
    return sorted(
        path for path in root.rglob("*")
        if path.is_file() and re.search(r"-[A-Z]{2}-Reviews-.*\.xlsx?$", path.name, re.I)
    )


def import_review_exports_from_directory(db: Session, directory: str | Path, limit: int = 5000) -> dict:
    files = find_sellersprite_review_exports(directory)
    imported = []
    failures = []
    for path in files:
        try:
            preview_rows = preview_reviews_from_workbook(path, limit=limit, source_file_name=path.name)
            result = import_reviews_from_workbook(db, path, limit=limit, source_file_name=path.name)
            mark_capture_jobs_imported(db, preview_rows, path.name)
            imported.append({"file": path.name, **result})
        except Exception as error:
            failures.append({"file": path.name, "error": str(error)})
    return {
        "files_found": len(files),
        "created": sum(item["created"] for item in imported),
        "updated": sum(item["updated"] for item in imported),
        "imported": imported,
        "failures": failures,
    }


def mark_capture_jobs_imported(db: Session, review_rows: list[dict], source_name: str) -> None:
    counts: dict[tuple[str | None, str | None], int] = {}
    for row in review_rows:
        asin = row.get("asin")
        if asin:
            key = (asin, row.get("site_code"))
            counts[key] = counts.get(key, 0) + 1
    for (asin, site_code), count in counts.items():
        jobs = db.query(ReviewCaptureJob).filter(
            ReviewCaptureJob.asin == asin,
            ReviewCaptureJob.site_code == site_code,
            ReviewCaptureJob.status == "待本机采集",
        ).all()
        for job in jobs:
            job.status = "已入库"
            job.source_file = source_name
            job.imported_review_count = count
            job.completed_at = datetime.now(UTC)
