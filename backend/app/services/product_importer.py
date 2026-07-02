import json
import re
from dataclasses import asdict, dataclass
from datetime import date
from pathlib import Path

import pandas as pd
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.product_metric import ProductMetricHistory
from app.models.store import Store


@dataclass
class NormalizedProductRow:
    platform: str
    site_code: str
    title: str
    store_name: str | None = None
    department_item_no: str | None = None
    sku: str | None = None
    asin: str | None = None
    parent_asin: str | None = None
    brand: str | None = None
    category_path: str | None = None
    category_name: str | None = None
    product_url: str | None = None
    image_url: str | None = None
    price_amount: float | None = None
    price_currency: str | None = None
    monthly_sales: int | None = None
    monthly_revenue: float | None = None
    review_count: int | None = None
    rating: float | None = None
    qa_count: int | None = None
    variation_count: int | None = None
    seller_count: int | None = None
    buybox_seller: str | None = None
    fulfillment_type: str | None = None
    launch_date: date | None = None
    keyword_total: int | None = None
    keyword_organic: int | None = None
    keyword_ads: int | None = None
    bsr_main: int | None = None
    bsr_sub: int | None = None
    weight_text: str | None = None
    size_text: str | None = None
    package_weight_text: str | None = None
    package_size_text: str | None = None
    supplier_name: str | None = None
    supplier_factory: str | None = None
    status: str | None = None
    source_file: str | None = None
    raw_payload: str | None = None


@dataclass
class NormalizedStoreRow:
    platform: str
    site_code: str
    store_name: str | None = None
    seller_identifier: str | None = None
    store_page_url: str | None = None
    source_file: str | None = None


@dataclass
class ProductMetricRow:
    platform: str
    site_code: str
    metric_type: str
    metric_month: str
    asin: str | None = None
    sku: str | None = None
    parent_asin: str | None = None
    title: str | None = None
    product_url: str | None = None
    metric_value: float | None = None
    source_file: str | None = None


SITE_CODE_BY_HINT = {
    ".com": "US",
    ".ca": "CA",
    ".co.uk": "UK",
    ".de": "DE",
    ".co.jp": "JP",
}

METRIC_SHEET_MAP = {
    "产品历史月销量": "monthly_sales",
    "历史月销售额": "monthly_revenue",
    "历史月价格": "monthly_price",
}


def preview_internal_store_products(path: str | Path, limit: int = 20) -> list[dict]:
    df = pd.read_excel(path, sheet_name="店铺商品汇总")
    rows = [normalize_internal_row(row, Path(path).name) for _, row in df.head(limit).iterrows()]
    return [asdict(row) for row in rows]


def preview_sellersprite_products(path: str | Path, sheet_name: str | None = None, limit: int = 20) -> list[dict]:
    with pd.ExcelFile(path) as workbook:
        target_sheet = sheet_name or workbook.sheet_names[0]
    df = pd.read_excel(path, sheet_name=target_sheet)
    rows = [normalize_sellersprite_row(row, Path(path).name) for _, row in df.head(limit).iterrows()]
    return [asdict(row) for row in rows]


def preview_internal_store_links(path: str | Path) -> list[dict]:
    df = pd.read_excel(path, sheet_name="亚马逊店铺搜索页")
    rows = [normalize_store_row(row, Path(path).name) for _, row in df.iterrows()]
    cleaned = [row for row in rows if row.store_page_url]
    return [asdict(row) for row in cleaned]


def preview_sellersprite_sales_history(path: str | Path, limit: int = 20) -> list[dict]:
    rows: list[ProductMetricRow] = []
    with pd.ExcelFile(path) as workbook:
        for sheet_name, metric_type in METRIC_SHEET_MAP.items():
            if sheet_name not in workbook.sheet_names:
                continue
            df = pd.read_excel(path, sheet_name=sheet_name)
            for _, row in df.iterrows():
                rows.extend(normalize_metric_history_row(row, metric_type, Path(path).name))
                if len(rows) >= limit:
                    return [asdict(item) for item in rows[:limit]]
    return [asdict(item) for item in rows[:limit]]


def import_internal_store_links(db: Session, path: str | Path) -> dict[str, int]:
    rows = preview_internal_store_links(path)
    created = 0
    updated = 0
    for row in rows:
        existing = db.execute(
            select(Store).where(
                Store.platform == row["platform"],
                Store.site_code == row["site_code"],
                Store.store_page_url == row["store_page_url"],
            )
        ).scalar_one_or_none()
        if existing:
            existing.store_name = row["store_name"]
            existing.seller_identifier = row["seller_identifier"]
            existing.notes = f"source_file={row['source_file']}"
            updated += 1
            continue
        db.add(
            Store(
                platform=row["platform"],
                site_code=row["site_code"],
                country_code=row["site_code"],
                name=row["store_name"] or row["platform"],
                seller_identifier=row["seller_identifier"],
                store_page_url=row["store_page_url"],
                data_source="manual_sheet",
                notes=f"source_file={row['source_file']}",
            )
        )
        created += 1
    return {"created": created, "updated": updated}


def import_sellersprite_sales_history(db: Session, path: str | Path, limit: int = 200) -> dict[str, int]:
    rows = preview_sellersprite_sales_history(path, limit)
    created = 0
    updated = 0
    for row in rows:
        existing = db.execute(
            select(ProductMetricHistory).where(
                ProductMetricHistory.platform == row["platform"],
                ProductMetricHistory.site_code == row["site_code"],
                ProductMetricHistory.metric_type == row["metric_type"],
                ProductMetricHistory.metric_month == row["metric_month"],
                ProductMetricHistory.asin == row["asin"],
            )
        ).scalar_one_or_none()
        if existing:
            existing.metric_value = row["metric_value"]
            existing.title = row["title"]
            existing.product_url = row["product_url"]
            existing.source_file = row["source_file"]
            updated += 1
            continue
        db.add(
            ProductMetricHistory(
                platform=row["platform"],
                site_code=row["site_code"],
                metric_type=row["metric_type"],
                metric_month=row["metric_month"],
                asin=row["asin"],
                sku=row["sku"],
                parent_asin=row["parent_asin"],
                title=row["title"],
                product_url=row["product_url"],
                metric_value=row["metric_value"],
                source_file=row["source_file"],
            )
        )
        created += 1
    return {"created": created, "updated": updated}


def import_internal_store_products(db: Session, path: str | Path, limit: int = 200) -> dict[str, int]:
    rows = preview_internal_store_products(path, limit)
    return _upsert_products(db, rows)


def import_sellersprite_products(db: Session, path: str | Path, limit: int = 200, sheet_name: str | None = None) -> dict[str, int]:
    rows = preview_sellersprite_products(path, sheet_name, limit)
    return _upsert_products(db, rows)


def normalize_internal_row(row: pd.Series, source_file: str) -> NormalizedProductRow:
    price_text = _safe_text(row.get("价格"))
    rating_text = _safe_text(row.get("评分/留评率"))
    site_code = infer_site_code(_safe_text(row.get("产品链接")), _safe_text(row.get("店铺名称")))
    return NormalizedProductRow(
        platform="Amazon",
        site_code=site_code,
        store_name=_safe_text(row.get("店铺名称")),
        department_item_no=_safe_text(row.get("ITEM NO.")),
        asin=_safe_text(row.get("ASIN")),
        title=_safe_text(row.get("产品Title")) or "未命名产品",
        category_name=_safe_text(row.get("产品类目")),
        product_url=_safe_text(row.get("产品链接")),
        monthly_sales=_extract_first_int(_safe_text(row.get("近30天销量"))),
        review_count=_coerce_int(row.get("Reviews总数量")),
        rating=_extract_first_float(rating_text),
        variation_count=_coerce_int(row.get("变体数") or row.get("变体数量")),
        seller_count=_coerce_int(row.get("跟卖卖家")),
        price_amount=_extract_first_float(price_text),
        price_currency=_detect_currency(price_text),
        keyword_total=_coerce_int(row.get("全部流量词")),
        keyword_organic=_coerce_int(row.get("自然搜索词")),
        keyword_ads=_coerce_int(row.get("广告流量")),
        supplier_factory=_safe_text(row.get("工厂")),
        supplier_name=_safe_text(row.get("工厂")),
        size_text=_safe_text(row.get("商品尺寸")),
        weight_text=_safe_text(row.get("商品重量")),
        package_size_text=_safe_text(row.get("包装尺寸")),
        package_weight_text=_safe_text(row.get("包装重量")),
        source_file=source_file,
        raw_payload=json.dumps(_normalize_payload(row), ensure_ascii=False),
    )


def normalize_sellersprite_row(row: pd.Series, source_file: str) -> NormalizedProductRow:
    url = _safe_text(row.get("商品详情页链接") or row.get("URL"))
    title = _safe_text(row.get("商品标题"))
    return NormalizedProductRow(
        platform="Amazon",
        site_code=infer_site_code(url, None),
        store_name=_safe_text(row.get("BuyBox卖家")),
        sku=_safe_text(row.get("SKU")),
        asin=_safe_text(row.get("ASIN")),
        parent_asin=_safe_text(row.get("父ASIN")),
        title=title or "未命名产品",
        brand=_safe_text(row.get("品牌")),
        category_path=_safe_text(row.get("类目路径") or row.get("所属类目")),
        category_name=_safe_text(row.get("小类目") or row.get("大类目")),
        product_url=url,
        image_url=_safe_text(row.get("商品主图")),
        price_amount=_coerce_float(row.get("价格(CDN$)")),
        price_currency=_detect_currency_from_columns(row.index),
        monthly_sales=_coerce_int(row.get("月销量")),
        monthly_revenue=_coerce_float(row.get("月销售额(CDN$)")),
        review_count=_coerce_int(row.get("评分数")),
        rating=_coerce_float(row.get("评分")),
        qa_count=_coerce_int(row.get("Q&A")),
        variation_count=_coerce_int(row.get("变体数")),
        seller_count=_coerce_int(row.get("卖家数")),
        buybox_seller=_safe_text(row.get("BuyBox卖家")),
        fulfillment_type=_safe_text(row.get("配送方式")),
        launch_date=_coerce_date(row.get("上架时间")),
        keyword_total=_coerce_int(row.get("AC关键词")),
        bsr_main=_coerce_int(row.get("大类BSR")),
        bsr_sub=_coerce_int(row.get("小类BSR")),
        weight_text=_safe_text(row.get("商品重量")),
        size_text=_safe_text(row.get("商品尺寸")),
        package_weight_text=_safe_text(row.get("包装重量")),
        package_size_text=_safe_text(row.get("包装尺寸")),
        source_file=source_file,
        raw_payload=json.dumps(_normalize_payload(row), ensure_ascii=False),
    )


def normalize_store_row(row: pd.Series, source_file: str) -> NormalizedStoreRow:
    raw_store_name = _safe_text(row.get("店铺")) or _safe_text(row.get("店铺名称"))
    url = _safe_text(row.get("所有产品页链接"))
    normalized_name = raw_store_name.replace("  ", " ") if raw_store_name else None
    platform = _infer_platform(url, normalized_name)
    return NormalizedStoreRow(
        platform=platform,
        site_code=_infer_site_code_from_platform(platform, url, normalized_name),
        store_name=normalized_name,
        seller_identifier=_extract_seller_identifier(url, platform),
        store_page_url=url,
        source_file=source_file,
    )


def normalize_metric_history_row(row: pd.Series, metric_type: str, source_file: str) -> list[ProductMetricRow]:
    url = _safe_text(row.get("URL"))
    site_code = infer_site_code(url, None)
    rows: list[ProductMetricRow] = []
    fixed_columns = {"图片", "ASIN", "SKU", "URL", "所属类目", "商品标题", "父ASIN"}
    for column in row.index:
        if column in fixed_columns:
            continue
        value = _coerce_float(row.get(column))
        if value is None:
            continue
        metric_month = str(column).split("(")[0]
        rows.append(
            ProductMetricRow(
                platform="Amazon",
                site_code=site_code,
                metric_type=metric_type,
                metric_month=metric_month,
                asin=_safe_text(row.get("ASIN")),
                sku=_safe_text(row.get("SKU")),
                parent_asin=_safe_text(row.get("父ASIN")),
                title=_safe_text(row.get("商品标题")),
                product_url=url,
                metric_value=value,
                source_file=source_file,
            )
        )
    return rows


def infer_site_code(url: str | None, store_name: str | None) -> str:
    text = (url or "") + " " + (store_name or "")
    for hint, code in SITE_CODE_BY_HINT.items():
        if hint in text:
            return code
    if "英国" in text:
        return "UK"
    if "德国" in text:
        return "DE"
    if "日本" in text:
        return "JP"
    if "加拿大" in text:
        return "CA"
    if "韩国" in text or "coupang" in text or "naver" in text:
        return "KR"
    return "US"


def _infer_platform(url: str | None, store_name: str | None) -> str:
    text = ((url or "") + " " + (store_name or "")).lower()
    if "coupang" in text:
        return "Coupang"
    if "naver" in text:
        return "Naver"
    return "Amazon"


def _infer_site_code_from_platform(platform: str, url: str | None, store_name: str | None) -> str:
    if platform in {"Coupang", "Naver"}:
        return "KR"
    return infer_site_code(url, store_name)


def _extract_seller_identifier(url: str | None, platform: str) -> str | None:
    if not url:
        return None
    if platform == "Amazon":
        match = re.search(r"[?&]me=([^&]+)", url)
        return match.group(1) if match else None
    return None


def _extract_first_int(text: str | None) -> int | None:
    if not text:
        return None
    match = re.search(r"(\d+)", text.replace(",", ""))
    return int(match.group(1)) if match else None


def _extract_first_float(text: str | None) -> float | None:
    if not text:
        return None
    match = re.search(r"(\d+(?:\.\d+)?)", text.replace(",", ""))
    return float(match.group(1)) if match else None


def _coerce_int(value) -> int | None:
    if pd.isna(value):
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return _extract_first_int(str(value))


def _coerce_float(value) -> float | None:
    if pd.isna(value):
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return _extract_first_float(str(value))


def _coerce_date(value) -> date | None:
    if pd.isna(value):
        return None
    try:
        return pd.to_datetime(value).date()
    except (TypeError, ValueError):
        return None


def _detect_currency(text: str | None) -> str | None:
    if not text:
        return None
    if "CA$" in text or "CDN$" in text:
        return "CAD"
    if "£" in text:
        return "GBP"
    if "€" in text:
        return "EUR"
    if "¥" in text:
        return "JPY"
    if "$" in text:
        return "USD"
    return None


def _detect_currency_from_columns(columns) -> str | None:
    columns_text = " ".join(map(str, columns))
    if "CDN$" in columns_text:
        return "CAD"
    return None


def _safe_text(value) -> str | None:
    if pd.isna(value):
        return None
    text = str(value).strip()
    return text or None


def _normalize_payload(row: pd.Series) -> dict:
    payload = {}
    for key, value in row.to_dict().items():
        if pd.isna(value):
            payload[str(key)] = None
        else:
            payload[str(key)] = value if isinstance(value, (int, float, str, bool)) else str(value)
    return payload


def _upsert_products(db: Session, rows: list[dict]) -> dict[str, int]:
    created = 0
    updated = 0
    for row in rows:
        existing = db.execute(
            select(Product).where(
                Product.platform == row["platform"],
                Product.site_code == row["site_code"],
                Product.asin == row["asin"],
                Product.store_name == row["store_name"],
            )
        ).scalar_one_or_none()
        if existing:
            _apply_product_row(existing, row)
            updated += 1
            continue
        product = Product(
            platform=row["platform"],
            site_code=row["site_code"],
            title=row["title"],
        )
        _apply_product_row(product, row)
        db.add(product)
        created += 1
    return {"created": created, "updated": updated}


def _apply_product_row(product: Product, row: dict) -> None:
    product.store_name = row.get("store_name")
    product.department_item_no = row.get("department_item_no")
    product.sku = row.get("sku")
    product.asin = row.get("asin")
    product.parent_asin = row.get("parent_asin")
    product.title = row.get("title") or product.title
    product.brand = row.get("brand")
    product.category_path = row.get("category_path")
    product.category_name = row.get("category_name")
    product.product_url = row.get("product_url")
    product.image_url = row.get("image_url")
    product.price_amount = row.get("price_amount")
    product.price_currency = row.get("price_currency")
    product.monthly_sales = row.get("monthly_sales")
    product.monthly_revenue = row.get("monthly_revenue")
    product.review_count = row.get("review_count")
    product.rating = row.get("rating")
    product.qa_count = row.get("qa_count")
    product.variation_count = row.get("variation_count")
    product.seller_count = row.get("seller_count")
    product.buybox_seller = row.get("buybox_seller")
    product.fulfillment_type = row.get("fulfillment_type")
    product.launch_date = row.get("launch_date")
    product.keyword_total = row.get("keyword_total")
    product.keyword_organic = row.get("keyword_organic")
    product.keyword_ads = row.get("keyword_ads")
    product.bsr_main = row.get("bsr_main")
    product.bsr_sub = row.get("bsr_sub")
    product.weight_text = row.get("weight_text")
    product.size_text = row.get("size_text")
    product.package_weight_text = row.get("package_weight_text")
    product.package_size_text = row.get("package_size_text")
    product.supplier_name = row.get("supplier_name")
    product.supplier_factory = row.get("supplier_factory")
    product.status = row.get("status")
    product.source_file = row.get("source_file")
    product.raw_payload = row.get("raw_payload")
