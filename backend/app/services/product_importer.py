import json
import re
from dataclasses import asdict, dataclass
from datetime import date
from pathlib import Path

import pandas as pd


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


SITE_CODE_BY_HINT = {
    ".com": "US",
    ".ca": "CA",
    ".co.uk": "UK",
    ".de": "DE",
    ".co.jp": "JP",
}


def preview_internal_store_products(path: str | Path, limit: int = 20) -> list[dict]:
    df = pd.read_excel(path, sheet_name="店铺商品汇总")
    rows = [normalize_internal_row(row, Path(path).name) for _, row in df.head(limit).iterrows()]
    return [asdict(row) for row in rows]


def preview_sellersprite_products(path: str | Path, sheet_name: str | None = None, limit: int = 20) -> list[dict]:
    target_sheet = sheet_name or pd.ExcelFile(path).sheet_names[0]
    df = pd.read_excel(path, sheet_name=target_sheet)
    rows = [normalize_sellersprite_row(row, Path(path).name) for _, row in df.head(limit).iterrows()]
    return [asdict(row) for row in rows]


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
    return "US"


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
