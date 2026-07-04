import json
import re
from html import unescape
from urllib.parse import urlparse
from urllib.request import Request, urlopen


def fetch_page_html(url: str, timeout: int = 15) -> str:
    request = Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
            ),
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,ko;q=0.7,ja;q=0.6",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
    )
    for context in (None, __import__("ssl")._create_unverified_context()):
        try:
            with urlopen(request, timeout=timeout, context=context) as response:
                charset = response.headers.get_content_charset() or "utf-8"
                return response.read().decode(charset, errors="ignore")
        except Exception:
            continue
    raise RuntimeError("目标页面当前无法访问，可能存在证书、反爬或频控限制。")


def preview_product_from_url(url: str, html: str | None = None) -> dict:
    platform, site_code = detect_platform_and_site(url)
    url_title = extract_title_from_url(url)
    try:
        page_html = html if html is not None else fetch_page_html(url)
    except Exception as exc:
        return {
            "platform": platform,
            "site_code": site_code,
            "title": url_title or "未成功抓取商品页",
            "asin": extract_asin(url, "") if platform == "Amazon" else None,
            "sku": None,
            "product_url": url,
            "image_url": None,
            "price_amount": None,
            "price_currency": None,
            "review_count": None,
            "rating": None,
            "store_name": None,
            "category_name": None,
            "source_file": "url_capture",
            "raw_payload": json.dumps({"capture_url": url, "platform": platform, "site_code": site_code}, ensure_ascii=False),
            "capture_status": "error",
            "capture_note": f"当前环境访问失败：{exc}。标题已尝试按链接路径兜底。",
        }
    payload = {
        "platform": platform,
        "site_code": site_code,
        "title": extract_product_title(page_html),
        "brand": None,
        "asin": extract_asin(url, page_html) if platform == "Amazon" else None,
        "sku": None,
        "product_url": extract_canonical_url(page_html) or url,
        "image_url": extract_primary_image(page_html),
        "price_amount": None,
        "price_currency": None,
        "review_count": None,
        "rating": None,
        "store_name": None,
        "category_name": None,
        "source_file": "url_capture",
        "raw_payload": json.dumps({"capture_url": url, "platform": platform, "site_code": site_code}, ensure_ascii=False),
        "capture_status": "ok",
        "capture_note": "已按公开商品页字段解析，建议与卖家后台或导出表交叉校验。",
    }

    product_json = extract_product_json_ld(page_html)
    if product_json:
        brand = product_json.get("brand")
        offers = first_item(product_json.get("offers"))
        aggregate = first_item(product_json.get("aggregateRating"))
        payload["title"] = product_json.get("name") or payload["title"]
        payload["image_url"] = first_image(product_json.get("image")) or payload["image_url"]
        payload["brand"] = brand.get("name") if isinstance(brand, dict) else brand
        payload["sku"] = product_json.get("sku") or payload["sku"]
        payload["price_amount"] = to_float((offers or {}).get("price"))
        payload["price_currency"] = (offers or {}).get("priceCurrency")
        payload["review_count"] = to_int((aggregate or {}).get("reviewCount"))
        payload["rating"] = to_float((aggregate or {}).get("ratingValue"))
        payload["category_name"] = product_json.get("category") or payload["category_name"]

    payload["title"] = payload["title"] or extract_title_tag(page_html) or url_title or "未识别标题"
    if payload["price_amount"] is None:
        payload["price_amount"], payload["price_currency"] = extract_price(page_html, platform)
    if payload["review_count"] is None:
        payload["review_count"] = extract_review_count(page_html)
    if payload["rating"] is None:
        payload["rating"] = extract_rating(page_html)
    if payload["brand"] is None:
        payload["brand"] = extract_brand(page_html, platform)

    if not payload["title"] or payload["title"] == "未识别标题":
        payload["capture_status"] = "partial"
        payload["capture_note"] = "页面可访问，但核心字段未完整识别，建议改用导出表或人工补录。"
    elif url_title and payload["title"] == url_title and not payload["image_url"]:
        payload["capture_status"] = "partial"
        payload["capture_note"] = "当前标题按链接路径兜底识别；主图等字段仍需公开页正常返回后补全。"

    return payload


def detect_platform_and_site(url: str) -> tuple[str, str]:
    host = urlparse(url).netloc.lower()
    if "amazon.co.uk" in host:
        return "Amazon", "UK"
    if "amazon.de" in host:
        return "Amazon", "DE"
    if "amazon.co.jp" in host:
        return "Amazon", "JP"
    if "amazon.ca" in host:
        return "Amazon", "CA"
    if "amazon.fr" in host:
        return "Amazon", "FR"
    if "amazon." in host:
        return "Amazon", "US"
    if "coupang.com" in host:
        return "Coupang", "KR"
    if "naver.com" in host:
        return "Naver", "KR"
    return "Unknown", "OT"


def extract_product_json_ld(html: str) -> dict | None:
    for script_text in re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.I | re.S):
        try:
            data = json.loads(unescape(script_text.strip()))
        except json.JSONDecodeError:
            continue
        product = find_product_node(data)
        if product:
            return product
    return None


def find_product_node(data):
    if isinstance(data, dict):
        node_type = data.get("@type")
        if node_type == "Product" or (isinstance(node_type, list) and "Product" in node_type):
            return data
        for key in ("@graph", "itemListElement", "mainEntity"):
            if key in data:
                found = find_product_node(data[key])
                if found:
                    return found
    if isinstance(data, list):
        for item in data:
            found = find_product_node(item)
            if found:
                return found
    return None


def extract_meta_value(html: str, attr_name: str, attr_value: str) -> str | None:
    pattern = rf'<meta[^>]*{attr_name}=["\']{re.escape(attr_value)}["\'][^>]*content=["\'](.*?)["\']'
    match = re.search(pattern, html, re.I | re.S)
    return unescape(match.group(1).strip()) if match else None


def extract_primary_image(html: str) -> str | None:
    meta = extract_meta_value(html, "property", "og:image")
    if meta:
        return meta
    for pattern in [
        r'"hiRes"\s*:\s*"([^"]+)"',
        r'"large"\s*:\s*"([^"]+)"',
        r'"mainUrl"\s*:\s*"([^"]+)"',
        r'"image"\s*:\s*"([^"]+https:[^"]+)"',
        r'"landingImageUrl"\s*:\s*"([^"]+)"',
    ]:
        match = re.search(pattern, html, re.I | re.S)
        if match:
            return unescape(match.group(1).replace("\\u0026", "&").replace("\\/", "/"))
    return None


def extract_title_tag(html: str) -> str | None:
    match = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
    return normalize_space(unescape(match.group(1))) if match else None


def extract_product_title(html: str) -> str | None:
    candidates = [
        extract_meta_value(html, "property", "og:title"),
        extract_meta_value(html, "name", "twitter:title"),
    ]
    for pattern in [
        r'id=["\']productTitle["\'][^>]*>(.*?)<',
        r'class=["\'][^"\']*prod-buy-header__title[^"\']*["\'][^>]*>(.*?)<',
        r'class=["\'][^"\']*_2L3vDiadT9[^"\']*["\'][^>]*>(.*?)<',
    ]:
        match = re.search(pattern, html, re.I | re.S)
        if match:
            candidates.append(match.group(1))
    for item in candidates:
        text = normalize_space(unescape(strip_tags(item or "")))
        if text:
            return text
    return None


def extract_canonical_url(html: str) -> str | None:
    match = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\'](.*?)["\']', html, re.I | re.S)
    return unescape(match.group(1).strip()) if match else None


def extract_asin(url: str, html: str) -> str | None:
    for source in (url, html):
        for pattern in [r"/dp/([A-Z0-9]{10})", r"/product-reviews/([A-Z0-9]{10})", r'"asin"\s*:\s*"([A-Z0-9]{10})"', r'data-asin=["\']([A-Z0-9]{10})["\']']:
            match = re.search(pattern, source, re.I)
            if match:
                return match.group(1).upper()
    return None


def extract_title_from_url(url: str) -> str | None:
    path = urlparse(url).path or ""
    match = re.search(r"/([^/]+)/dp/[A-Z0-9]{10}", path, re.I)
    if not match:
        return None
    slug = match.group(1)
    words = [part for part in slug.split("-") if part]
    if not words:
        return None
    return normalize_space(" ".join(words))


def extract_price(html: str, platform: str) -> tuple[float | None, str | None]:
    patterns = [
        r'"price"\s*:\s*"([\d,.]+)"',
        r'class=["\']a-offscreen["\'][^>]*>\s*([$£€¥₩]|CA\$)\s*([\d,.]+)',
        r'class=["\'][^"\']*total-price[^"\']*["\'][^>]*>\s*([$£€¥₩]|CA\$)?\s*([\d,.]+)',
    ]
    for pattern in patterns:
        match = re.search(pattern, html, re.I | re.S)
        if not match:
            continue
        if len(match.groups()) == 1:
            return to_float(match.group(1)), infer_currency(platform)
        return to_float(match.group(2)), normalize_currency(match.group(1) or infer_currency(platform))
    return None, None


def extract_review_count(html: str) -> int | None:
    for pattern in [
        r'"reviewCount"\s*:\s*"?(\\?\d[\d,]*)"?',
        r'id=["\']acrCustomerReviewText["\'][^>]*>\s*([\d,]+)',
        r'class=["\'][^"\']*count[^"\']*["\'][^>]*>\s*([\d,]+)\s*(?:reviews|ratings|개)',
    ]:
        match = re.search(pattern, html, re.I | re.S)
        if match:
            return to_int(match.group(1))
    return None


def extract_rating(html: str) -> float | None:
    for pattern in [
        r'"ratingValue"\s*:\s*"([\d.]+)"',
        r'id=["\']acrPopover["\'][^>]*title=["\']([\d.]+)',
        r'([\d.]+)\s*(?:out of 5 stars|5점 만점|5つ星のうち)',
    ]:
        match = re.search(pattern, html, re.I | re.S)
        if match:
            return to_float(match.group(1))
    return None


def extract_brand(html: str, platform: str) -> str | None:
    if platform != "Amazon":
        return None
    match = re.search(r'id=["\']bylineInfo["\'][^>]*>\s*(.*?)<', html, re.I | re.S)
    return normalize_space(unescape(strip_tags(match.group(1)))) if match else None


def infer_currency(platform: str) -> str | None:
    return {"Amazon": "USD", "Coupang": "KRW", "Naver": "KRW"}.get(platform)


def normalize_currency(symbol: str) -> str:
    return {"$": "USD", "CA$": "CAD", "£": "GBP", "€": "EUR", "¥": "JPY", "₩": "KRW", "USD": "USD", "KRW": "KRW"}.get(symbol, symbol)


def strip_tags(text: str) -> str:
    return re.sub(r"<[^>]+>", " ", text)


def normalize_space(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def to_float(value) -> float | None:
    if value in (None, ""):
        return None
    try:
        return float(str(value).replace(",", "").strip())
    except ValueError:
        return None


def to_int(value) -> int | None:
    if value in (None, ""):
        return None
    digits = re.sub(r"[^\d]", "", str(value))
    return int(digits) if digits else None


def first_item(value):
    return value[0] if isinstance(value, list) and value else value


def first_image(value) -> str | None:
    item = first_item(value)
    if isinstance(item, dict):
        return item.get("url")
    if isinstance(item, str):
        return item
    return None
