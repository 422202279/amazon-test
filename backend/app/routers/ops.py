import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.import_job import ImportJob
from app.models.user_account import UserAccount
from app.serializers import to_dict
from app.security import get_current_user
from app.services.data_quality import build_data_quality_summary
from app.services.product_importer import (
    import_internal_store_links,
    import_internal_store_products,
    import_sellersprite_sales_history,
    import_sellersprite_products,
    preview_internal_store_links,
    preview_internal_store_products,
    preview_sellersprite_sales_history,
    preview_sellersprite_products,
)

router = APIRouter(prefix="/ops", tags=["ops"])


@router.get("/import-jobs")
def list_import_jobs(limit: int = 50, db: Session = Depends(get_db)):
    items = db.query(ImportJob).order_by(ImportJob.created_at.desc(), ImportJob.id.desc()).limit(limit).all()
    payload = []
    for item in items:
        data = to_dict(item)
        if item.error_summary:
            try:
                data["error_summary"] = json.loads(item.error_summary)
            except json.JSONDecodeError:
                pass
        payload.append(data)
    return {"items": payload}


@router.get("/data-quality")
def data_quality_summary(db: Session = Depends(get_db)):
    return build_data_quality_summary(db)


@router.get("/schedule-settings")
def schedule_settings():
    return {
        "default_times": [item.strip() for item in settings.default_schedule_times.split(",") if item.strip()],
        "max_schedule_times": settings.max_schedule_times,
        "recommended_strategy": "daily_low_frequency",
        "notes": "最低配云服务器建议默认每天 06:00 跑一次，可额外自定义 1~2 个时间点。",
    }


@router.post("/manual-refresh")
def manual_refresh(target: str, source_mode: str = "standard"):
    return {
        "status": "queued",
        "target": target,
        "source_mode": source_mode,
        "message": "原型阶段先返回任务已加入队列，后续接入真实后台任务执行器。",
    }


@router.get("/source-capabilities")
def source_capabilities():
    return {
        "items": [
            {
                "platform": "Amazon",
                "coverage": "北美 / 欧洲 / 日本",
                "product_mode": "可通过导出表 + 链接补充",
                "review_mode": "优先导入；云端不建议依赖页面抓取",
                "automation_level": "半自动",
                "cloud_ready": True,
                "accuracy_note": "产品数据可较稳定获取；评论全量自动化需谨慎，优先导入或官方卖家侧数据。",
            },
            {
                "platform": "Coupang",
                "coverage": "韩国",
                "product_mode": "无卖家 API 时仅适合人工采集 / 手工导入",
                "review_mode": "买家侧页面不适合云端自动主链路",
                "automation_level": "手动优先",
                "cloud_ready": False,
                "accuracy_note": "若后续有 WING / Open API，可升级为自动；当前不建议依赖公网爬取。",
            },
            {
                "platform": "Naver",
                "coverage": "韩国",
                "product_mode": "有 Commerce API 时可升级自动；当前先人工导入",
                "review_mode": "先做重点样本评论，不建议依赖云端抓取",
                "automation_level": "手动优先",
                "cloud_ready": False,
                "accuracy_note": "无卖家 API 的情况下，建议低频手动更新主档与重点评论样本。",
            },
        ],
        "recommended_main_chain": [
            "Amazon：导出表 + 系统导入 + 定时刷新趋势",
            "Coupang：人工采集主档 + 模板导入",
            "Naver：人工采集主档 + 模板导入",
        ],
    }


@router.get("/deployment-profile")
def deployment_profile():
    return {
        "target_scale": "个人 / 2~5人小团队",
        "minimum_server": "2核2G 云服务器即可",
        "os": "Ubuntu 22.04 LTS",
        "runtime": ["Python 3.12", "FastAPI", "SQLite", "Nginx", "systemd"],
        "domain_required": True,
        "ssl_required": True,
        "ssl_plan": "Let's Encrypt 免费证书",
        "storage_strategy": "评论图片只保留缩略图或链接，视频只保留封面图与原链接",
        "traffic_strategy": "默认低频任务，每天 06:00 跑一次；韩国站不做高频自动抓取",
        "notes": "当前方案按最低成本设计，不依赖额外付费数据库或消息队列。",
    }


@router.get("/live-validation")
def live_validation():
    internal_path = "/Users/jcc_mac/Documents/A新禾亚马逊一部/产品信息汇总表 新系统一些SKU加点版本_在售版本汇总.xlsx"
    sellersprite_path = "/Users/jcc_mac/Downloads/Product-CA-20260702.xlsx"
    payload = {
        "internal_products": [],
        "sellersprite_products": [],
        "store_links": [],
        "http_checks": [
            {
                "target": "Amazon 商品页",
                "status": "可低频校验",
                "code": 200,
                "notes": "适合校验标题、ASIN、评分、Review数、链接有效性。",
            },
            {
                "target": "Coupang 商品页",
                "status": "不适合作为云端自动主链路",
                "code": 403,
                "notes": "当前公开页访问受限，建议人工采集或卖家 API。",
            },
            {
                "target": "Naver 商品页",
                "status": "不适合作为云端自动主链路",
                "code": 429,
                "notes": "当前公开页频控明显，建议人工采集或 Commerce API。",
            },
        ],
        "verified_fields": {
            "internal_products": ["店铺", "ASIN", "标题", "产品链接", "评分", "Review数", "近30天销量", "工厂"],
            "sellersprite_products": ["店铺", "ASIN", "标题", "产品链接", "价格", "评分", "Review数"],
            "store_links": ["平台", "站点", "店铺名", "店铺链接"],
        },
    }

    try:
        payload["internal_products"] = preview_internal_store_products(internal_path, limit=2)
    except Exception as exc:  # pragma: no cover - best effort preview
        payload["internal_products_error"] = str(exc)

    try:
        payload["sellersprite_products"] = preview_sellersprite_products(sellersprite_path, limit=2)
    except Exception as exc:  # pragma: no cover - best effort preview
        payload["sellersprite_products_error"] = str(exc)

    try:
        payload["store_links"] = preview_internal_store_links(internal_path)[:2]
    except Exception as exc:  # pragma: no cover - best effort preview
        payload["store_links_error"] = str(exc)

    return payload


@router.post("/bootstrap-local-data")
def bootstrap_local_data(
    db: Session = Depends(get_db),
    _: UserAccount = Depends(get_current_user),
):
    internal_path = "/Users/jcc_mac/Documents/A新禾亚马逊一部/产品信息汇总表 新系统一些SKU加点版本_在售版本汇总.xlsx"
    product_path = "/Users/jcc_mac/Downloads/Product-CA-20260702.xlsx"
    sales_path = "/Users/jcc_mac/Downloads/product-CA-sales-20260702-71124.xlsx"
    result = {
        "stores": {"created": 0, "updated": 0},
        "internal_products": {"created": 0, "updated": 0},
        "sellersprite_products": {"created": 0, "updated": 0},
        "sales_history": {"created": 0, "updated": 0},
    }
    result["stores"] = import_internal_store_links(db, internal_path)
    result["internal_products"] = import_internal_store_products(db, internal_path, 200)
    result["sellersprite_products"] = import_sellersprite_products(db, product_path, 200)
    result["sales_history"] = import_sellersprite_sales_history(db, sales_path, 200)
    db.commit()
    return result
