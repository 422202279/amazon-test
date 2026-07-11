import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel
from sqlalchemy import func
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
    site_codes = _scope_site_codes(scope)
    product_query = db.query(Product)
    review_query = db.query(Review)
    if site_codes:
        product_query = product_query.filter(Product.site_code.in_(site_codes))
        review_query = review_query.filter(Review.site_code.in_(site_codes))
    product_total = product_query.count()
    review_total = review_query.count()
    negative_total = review_query.filter(Review.is_negative_review.is_(True)).count()
    task_total = db.query(SupplierTask).count()
    task_open = db.query(SupplierTask).filter(SupplierTask.status.in_(["pending_feedback", "in_progress", "observing"])).count()

    report_products = product_query.order_by(Product.site_code, Product.store_name, Product.asin, Product.id).all()
    latest_products = report_products[:20]
    latest_reviews = review_query.order_by(Review.reviewed_at.desc(), Review.id.desc()).limit(20).all()
    latest_tasks = db.query(SupplierTask).order_by(SupplierTask.updated_at.desc(), SupplierTask.id.desc()).limit(5).all()
    issue_rows = (
        review_query.with_entities(Review.issue_category, func.count(Review.id))
        .filter(Review.is_negative_review.is_(True))
        .group_by(Review.issue_category)
        .order_by(func.count(Review.id).desc())
        .limit(5)
        .all()
    )

    snapshot = {
        "report_type": report_type,
        "scope": scope,
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "product_total": product_total,
        "review_total": review_total,
        "negative_total": negative_total,
        "task_total": task_total,
        "task_open": task_open,
        "product_rows": [_product_export_row(item) for item in report_products],
        "review_rows": [_review_export_row(item) for item in latest_reviews],
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
        "## 产品指标表（前20条，完整明细见表格导出）",
        "",
    ]
    if latest_products:
        lines.extend(["| 产品 | 站点 | ASIN | 评分 | Review总数 | 近30天销量 |", "|---|---|---|---:|---:|---:|"])
        lines.extend([
            f"| {item.title} | {item.platform}-{item.site_code} | {item.asin or '-'} | {item.rating or '-'} | {item.review_count or '-'} | {item.monthly_sales or '-'} |"
            for item in latest_products
        ])
    else:
        lines.append("- 暂无产品数据")

    lines.extend(["", "## 评论证据表", ""])
    if latest_reviews:
        lines.extend(["| 产品 | 星级 | 评论时间 | 问题分类 | 评论标题 |", "|---|---:|---|---|---|"])
        lines.extend([
            f"| {item.product_title or '未命名产品'} | {item.star_rating or '-'} | {item.reviewed_at or '-'} | {item.issue_category or '待分类'} | {item.review_title or '无标题'} |"
            for item in latest_reviews
        ])
    else:
        lines.append("- 暂无评论数据")

    lines.extend(["", "## 差评问题 TOP5", ""])
    if issue_rows:
        lines.extend(["| 问题分类 | 差评条数 |", "|---|---:|"])
        lines.extend([f"| {issue or '待分类'} | {count} |" for issue, count in issue_rows])
    else:
        lines.append("- 暂无真实差评明细，不能生成问题占比。")

    lines.extend(["", "## 整改任务跟进", ""])
    if latest_tasks:
        lines.extend(["| 任务编号 | ASIN | 问题 | 状态 | 优先级 | 截止时间 |", "|---|---|---|---|---|---|"])
        lines.extend([
            f"| {item.task_code or '-'} | {item.asin or '-'} | {item.issue_category or '-'} | {item.status} | {item.priority} | {item.due_date or '-'} |"
            for item in latest_tasks
        ])
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


def _scope_site_codes(scope: str | None) -> list[str]:
    labels = {"美国": "US", "英国": "UK", "德国": "DE", "日本": "JP", "加拿大": "CA", "法国": "FR", "韩国": "KR"}
    return [code for label, code in labels.items() if label in (scope or "")]


def _product_export_row(item: Product) -> dict:
    return {
        "平台": item.platform,
        "站点": item.site_code,
        "店铺": item.store_name or "",
        "ASIN": item.asin or "",
        "SKU": item.sku or "",
        "产品标题": item.title,
        "品牌": item.brand or "",
        "类目": item.category_name or item.category_path or "",
        "价格": item.price_amount,
        "币种": item.price_currency or "",
        "近30天销量": item.monthly_sales,
        "近30天销售额": item.monthly_revenue,
        "评分": item.rating,
        "Review总数": item.review_count,
        "大类BSR": item.bsr_main,
        "小类BSR": item.bsr_sub,
        "变体数": item.variation_count,
        "尺寸": item.size_text or "",
        "重量": item.weight_text or "",
        "产品链接": item.product_url or "",
        "数据来源": item.source_file or "",
        "更新时间": item.updated_at.isoformat(sep=" ", timespec="seconds") if item.updated_at else "",
    }


def _review_export_row(item: Review) -> dict:
    return {
        "平台": item.platform,
        "站点": item.site_code,
        "店铺": item.store_name or "",
        "ASIN": item.asin or "",
        "产品标题": item.product_title or "",
        "星级": item.star_rating,
        "评论时间": item.reviewed_at.isoformat(sep=" ", timespec="seconds") if item.reviewed_at else "",
        "评论人": item.reviewer_name or "",
        "评论内容": item.review_content or "",
        "问题分类": item.issue_category or "",
        "评论链接": item.review_url or "",
    }
