from __future__ import annotations

import json

from sqlalchemy.orm import Session

from app.models.import_job import ImportJob


def create_import_job(
    db: Session,
    *,
    import_type: str,
    source_name: str,
    total_rows: int,
    success_rows: int,
    warning_rows: int = 0,
    issue_summary: dict | None = None,
) -> ImportJob:
    failed_rows = max(total_rows - success_rows, 0)
    status = _resolve_status(failed_rows, warning_rows)
    job = ImportJob(
        import_type=import_type,
        source_name=source_name,
        status=status,
        total_rows=total_rows,
        success_rows=success_rows,
        failed_rows=failed_rows,
        error_summary=json.dumps(
            {
                "warning_rows": warning_rows,
                "issue_summary": issue_summary or {},
            },
            ensure_ascii=False,
        ),
    )
    db.add(job)
    db.flush()
    return job


def _resolve_status(failed_rows: int, warning_rows: int) -> str:
    if failed_rows > 0:
        return "failed"
    if warning_rows > 0:
        return "warning"
    return "success"
