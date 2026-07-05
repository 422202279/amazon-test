import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.models.report import Report
from app.models.review import Review
from app.models.supplier_task import SupplierTask
from app.models.user_account import UserAccount
from app.serializers import to_dict
from app.security import get_current_user

router = APIRouter(prefix="/reports", tags=["reports"])


class ReportPayload(BaseModel):
    report_type: str
    title: str
    scope: str | None = None


@router.get("")
def list_reports(limit: int = 50, db: Session = Depends(get_db)):
    items = db.query(Report).order_by(Report.created_at.desc(), Report.id.desc()).limit(limit).all()
    return {"items": [to_dict(item) for item in items]}


@router.post("")
def create_report(
    payload: ReportPayload,
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    markdown, snapshot = _build_report_content(payload.report_type, payload.title, payload.scope, db)
    report = Report(
        report_type=payload.report_type,
        title=payload.title,
        scope=payload.scope,
        status="generated",
        markdown_content=markdown,
        source_snapshot=json.dumps(snapshot, ensure_ascii=False),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return to_dict(report)


@router.get("/{report_id}/markdown")
def export_report_markdown(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="报告不存在")
    content = report.markdown_content or f"# {report.title}\n\n暂无报告内容。"
    return PlainTextResponse(
        content=content,
        media_type="text/markdown; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="report-{report_id}.md"'},
    )


@router.get("/{report_id}/snapshot")
def export_report_snapshot(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="报告不存在")
    try:
        snapshot = json.loads(report.source_snapshot or "{}")
    except json.JSONDecodeError:
        snapshot = {}
    return JSONResponse(
        {
            "id": report.id,
            "title": report.title,
            "report_type": report.report_type,
            "scope": report.scope,
            "created_at": report.created_at.isoformat(sep=" ", timespec="seconds") if report.created_at else None,
            "status": report.status,
            "snapshot": snapshot,
            "markdown_content": report.markdown_content or "",
        }
    )


def _build_report_content(report_type: str, title: str, scope: str | None, db: Session) -> tuple[str, dict]:
    product_total = db.query(Product).count()
    review_total = db.query(Review).count()
    negative_total = db.query(Review).filter(Review.is_negative_review.is_(True)).count()
    task_total = db.query(SupplierTask).count()
    task_open = db.query(SupplierTask).filter(SupplierTask.status.in_(["pending_feedback", "in_progress", "observing"])).count()

    latest_products = db.query(Product).order_by(Product.updated_at.desc(), Product.id.desc()).limit(5).all()
    latest_reviews = db.query(Review).order_by(Review.reviewed_at.desc(), Review.id.desc()).limit(5).all()
    latest_tasks = db.query(SupplierTask).order_by(SupplierTask.updated_at.desc(), SupplierTask.id.desc()).limit(5).all()

    snapshot = {
        "report_type": report_type,
        "scope": scope,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "product_total": product_total,
        "review_total": review_total,
        "negative_total": negative_total,
        "task_total": task_total,
        "task_open": task_open,
    }

    lines = [
        f"# {title}",
        "",
        f"- 报告类型：{report_type}",
        f"- 覆盖范围：{scope or '全部'}",
        f"- 生成时间：{snapshot['generated_at']}",
        "",
        "## 核心概览",
        "",
        f"- 产品数：{product_total}",
        f"- 评论数：{review_total}",
        f"- 差评数：{negative_total}",
        f"- 整改任务数：{task_total}",
        f"- 未关闭整改任务：{task_open}",
        "",
        "## 最新产品样本",
        "",
    ]
    if latest_products:
        lines.extend([f"- {item.title} | {item.platform}-{item.site_code} | {item.asin or '-'} | 评分 {item.rating or '-'}" for item in latest_products])
    else:
        lines.append("- 暂无产品数据")

    lines.extend(["", "## 最新评论样本", ""])
    if latest_reviews:
        lines.extend([f"- {item.product_title or '未命名产品'} | {item.star_rating or '-'}星 | {item.issue_category or '待分类'} | {item.review_title or '无标题'}" for item in latest_reviews])
    else:
        lines.append("- 暂无评论数据")

    lines.extend(["", "## 整改任务跟进", ""])
    if latest_tasks:
        lines.extend([f"- {item.task_code or '-'} | {item.product_title or '未命名产品'} | {item.status} | {item.priority}" for item in latest_tasks])
    else:
        lines.append("- 暂无整改任务")

    lines.extend([
        "",
        "## 说明",
        "",
        "- 当前版本为模板化报告，适合云端最低配环境运行。",
        "- 深度结论、图片摘要、AI分析可作为后续增强项补入。",
    ])
    return "\n".join(lines), snapshot
