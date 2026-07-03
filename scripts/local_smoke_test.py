import json
import sys
import urllib.request


BASE = "http://127.0.0.1:8000/api"


def req(path: str, method: str = "GET", data: dict | None = None, token: str | None = None) -> dict:
    body = None if data is None else json.dumps(data).encode("utf-8")
    request = urllib.request.Request(f"{BASE}{path}", data=body, method=method)
    request.add_header("Content-Type", "application/json")
    if token:
        request.add_header("Authorization", f"Bearer {token}")
    with urllib.request.urlopen(request, timeout=120) as response:
        return json.loads(response.read().decode("utf-8"))


def main() -> int:
    login = req("/auth/login", "POST", {"email": "admin@cb-monitor.local", "password": "admin123456"})
    token = login["token"]

    bootstrap = req("/ops/bootstrap-local-data", "POST", token=token)
    created_product = req(
        "/products",
        "POST",
        {
            "platform": "Amazon",
            "site_code": "US",
            "store_name": "Smoke Store",
            "asin": "B0SMOKE001",
            "sku": "SMOKE-001",
            "title": "Smoke Product",
            "price_amount": 12.5,
            "price_currency": "$",
        },
        token,
    )
    updated_product = req(
        f"/products/{created_product['id']}",
        "PUT",
        {
            "platform": "Amazon",
            "site_code": "US",
            "store_name": "Smoke Store",
            "asin": "B0SMOKE001",
            "sku": "SMOKE-001",
            "title": "Smoke Product Updated",
            "price_amount": 14.5,
            "price_currency": "$",
        },
        token,
    )
    deleted_product = req(f"/products/{created_product['id']}", "DELETE", token=token)

    created_review = req(
        "/reviews",
        "POST",
        {
            "platform": "Amazon",
            "site_code": "US",
            "asin": "B0SMOKE001",
            "product_title": "Smoke Product Updated",
            "review_title": "Smoke Review",
            "star_rating": 2,
            "review_content": "Need fix",
            "is_negative_review": True,
            "has_images": False,
            "feedback_to_supplier": False,
            "source_type": "手动录入",
            "reviewed_at": "2026-07-04T10:00:00",
        },
        token,
    )
    updated_review = req(
        f"/reviews/{created_review['id']}",
        "PUT",
        {
            "platform": "Amazon",
            "site_code": "US",
            "asin": "B0SMOKE001",
            "product_title": "Smoke Product Updated",
            "review_title": "Smoke Review Updated",
            "star_rating": 4,
            "review_content": "Fixed",
            "is_negative_review": False,
            "has_images": False,
            "feedback_to_supplier": True,
            "source_type": "手动录入",
            "reviewed_at": "2026-07-04T10:30:00",
        },
        token,
    )
    deleted_review = req(f"/reviews/{created_review['id']}", "DELETE", token=token)

    created_task = req(
        "/supplier-tasks",
        "POST",
        {
            "task_code": "SR-SMOKE-001",
            "asin": "B0SMOKE001",
            "product_title": "Smoke Product Updated",
            "supplier_name": "Smoke Supplier",
            "issue_category": "质量问题",
            "evidence_summary": "Smoke evidence",
            "status": "pending_feedback",
            "priority": "medium",
        },
        token,
    )
    updated_task = req(
        f"/supplier-tasks/{created_task['id']}",
        "PUT",
        {
            "task_code": "SR-SMOKE-001",
            "asin": "B0SMOKE001",
            "product_title": "Smoke Product Updated 2",
            "supplier_name": "Smoke Supplier",
            "issue_category": "质量问题",
            "evidence_summary": "Smoke evidence 2",
            "status": "in_progress",
            "priority": "high",
        },
        token,
    )
    deleted_task = req(f"/supplier-tasks/{created_task['id']}", "DELETE", token=token)

    created_user = req(
        "/admin/users",
        "POST",
        {
            "name": "Smoke User",
            "email": "smoke-user@example.com",
            "role": "运营",
            "scope": "产品 / 评论",
            "stores": ["US Home Store"],
            "status": "启用",
            "password": "12345678",
        },
        token,
    )
    updated_user = req(
        f"/admin/users/{created_user['id']}",
        "PUT",
        {
            "name": "Smoke User 2",
            "email": "smoke-user@example.com",
            "role": "产品开发",
            "scope": "产品 / 评论 / 整改",
            "stores": ["CA Comfort"],
            "status": "启用",
            "password": "87654321",
        },
        token,
    )
    deleted_user = req(f"/admin/users/{created_user['id']}", "DELETE", token=token)

    result = {
        "login_user": login["user"]["email"],
        "bootstrap": bootstrap,
        "product_flow": [created_product["title"], updated_product["title"], deleted_product["ok"]],
        "review_flow": [created_review["review_title"], updated_review["review_title"], deleted_review["ok"]],
        "task_flow": [created_task["task_code"], updated_task["status"], deleted_task["ok"]],
        "user_flow": [created_user["email"], updated_user["role"], deleted_user["ok"]],
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
