from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.review import Review
from app.models.supplier_task import SupplierTask


def generate_tasks_from_negative_reviews(db: Session, limit: int = 100) -> dict[str, int]:
    db.flush()
    reviews = (
        db.execute(
            select(Review)
            .where(Review.is_negative_review.is_(True))
            .where(Review.feedback_to_supplier.is_(False))
            .limit(limit)
        )
        .scalars()
        .all()
    )

    created = 0
    updated = 0
    for review in reviews:
        existing = db.execute(
            select(SupplierTask).where(
                SupplierTask.asin == review.asin,
                SupplierTask.issue_category == review.issue_category,
                SupplierTask.status.in_(["pending_feedback", "in_progress", "observing"]),
            )
        ).scalar_one_or_none()

        evidence_summary = _build_evidence_summary(review)
        if existing:
            existing.evidence_summary = evidence_summary
            updated += 1
        else:
            task_code = f"SR-{(review.id or 0) + 3000}"
            db.add(
                SupplierTask(
                    task_code=task_code,
                    asin=review.asin,
                    product_title=review.product_title,
                    supplier_name="待补供应商",
                    issue_category=review.issue_category or "其他",
                    evidence_summary=evidence_summary,
                    status="pending_feedback",
                    priority=_priority_from_review(review),
                    due_date=(datetime.now(UTC) + timedelta(days=7)).date(),
                    notes=f"来源评论ID: {review.review_external_id}",
                )
            )
            created += 1
        review.feedback_to_supplier = True
        review.rectification_status = review.rectification_status or "待反馈"
    return {"created": created, "updated": updated}


def _build_evidence_summary(review: Review) -> str:
    pieces = [
        f"评论ID {review.review_external_id}" if review.review_external_id else None,
        f"{review.star_rating}星" if review.star_rating is not None else None,
        review.issue_category,
        review.review_title,
        review.review_content[:120] if review.review_content else None,
    ]
    return " | ".join([piece for piece in pieces if piece])


def _priority_from_review(review: Review) -> str:
    if review.star_rating is not None and review.star_rating <= 1:
        return "high"
    if review.star_rating is not None and review.star_rating == 2:
        return "medium"
    return "low"
