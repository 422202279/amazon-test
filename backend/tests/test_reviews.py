import sys
import tempfile
import unittest
from datetime import datetime
from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import Base
from app.routers.reviews import _serialize_review, list_review_capture_jobs, list_reviews, queue_review_captures
from app.models.user_account import UserAccount
from app.services.data_quality import build_data_quality_summary, validate_review_rows
from app.models.review import Review
from app.models.supplier_task import SupplierTask
from app.services.review_importer import (
    import_reviews_from_workbook,
    normalize_review_row,
    preview_reviews_from_workbook,
)
from app.services.review_batch_import import find_sellersprite_review_exports
from app.services.supplier_tasks import generate_tasks_from_negative_reviews


class ReviewWorkflowTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        self.session_factory = sessionmaker(bind=self.engine, autoflush=False, autocommit=False)
        Base.metadata.create_all(bind=self.engine)

    def test_preview_reviews_normalizes_generic_columns(self):
        with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
            workbook_path = tmp.name

        df = pd.DataFrame(
            [
                {
                    "平台": "Amazon",
                    "站点": "US",
                    "店铺": "美国老店",
                    "ASIN": "B0TEST001",
                    "产品标题": "Test Product A",
                    "评论ID": "RV-001",
                    "评论链接": "https://example.com/review/1",
                    "产品链接": "https://example.com/product/1",
                    "星级": 2,
                    "评论标题": "Too small",
                    "评论内容": "Size is smaller than expected.",
                    "评论图片": "https://img1, https://img2",
                    "评论人": "User A",
                    "评论国家": "US",
                    "评论语言": "en",
                    "是否Verified Purchase": "Y",
                    "点赞数": 3,
                    "问题分类": "尺寸问题",
                    "情绪": "负面",
                    "是否反馈供应商": "N",
                    "整改状态": "待反馈",
                    "评论时间": "2026-07-01 10:20:00",
                }
            ]
        )
        df.to_excel(workbook_path, index=False)

        rows = preview_reviews_from_workbook(workbook_path, limit=5)

        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["platform"], "Amazon")
        self.assertEqual(rows[0]["site_code"], "US")
        self.assertEqual(rows[0]["review_external_id"], "RV-001")
        self.assertEqual(rows[0]["issue_category"], "尺寸问题")
        self.assertTrue(rows[0]["has_images"])
        self.assertTrue(rows[0]["is_negative_review"])

    def test_review_batch_scanner_only_returns_sellersprite_review_exports(self):
        with tempfile.TemporaryDirectory() as directory:
            review = Path(directory) / "B0CHJ55J9G-CA-Reviews-20260711.xlsx"
            product = Path(directory) / "Product-CA-20260703.xlsx"
            ignored = Path(directory) / "notes.txt"
            review.touch()
            product.touch()
            ignored.touch()

            files = find_sellersprite_review_exports(directory)

        self.assertEqual(files, [review])

    def test_sellersprite_review_columns_keep_media_country_and_review_id(self):
        row = pd.Series({
            "ASIN": "B0CHJ55J9G",
            "标题": "Stopped charging",
            "内容": "It quit charging after six months.",
            "VP评论": "Y",
            "星级": 1,
            "是否有视频": "Y",
            "视频地址": "https://media.example.com/review.mp4",
            "评论链接": "https://www.amazon.com/gp/customer-reviews/R123ABC",
            "评论人": "Glenn",
            "所属国家": "US",
            "评论时间": "2026-06-16",
        })
        item = normalize_review_row(row, "B0CHJ55J9G-CA-Reviews-20260711.xlsx")

        self.assertEqual(item.site_code, "CA")
        self.assertEqual(item.review_external_id, "R123ABC")
        self.assertTrue(item.has_images)
        self.assertEqual(item.review_images, "https://media.example.com/review.mp4")
        self.assertEqual(item.issue_category, "质量问题")

    def test_sellersprite_srp_links_extract_the_real_review_id(self):
        row = pd.Series({
            "ASIN": None,
            "标题": "Broken",
            "内容": "Stopped working.",
            "星级": 1,
            "评论链接": "https://www.amazon.com/portal/customer-reviews/srp/-/R2I46APSWNTA1Q/ref=cm_cr_getr_d_rvw_ttl",
        })

        item = normalize_review_row(row, "B0CH2TXGTP-US-Reviews-20260713.xlsx")

        self.assertEqual(item.review_external_id, "R2I46APSWNTA1Q")

    def test_product_review_overview_exposes_real_aggregate_metrics(self):
        with self.session_factory() as db:
            db.add_all([
                Review(
                    platform="Amazon", site_code="CA", store_name="加拿大店", asin="B0GROUP001",
                    product_title="Launcher", star_rating=1, review_content="Stopped working", has_images=True,
                    is_negative_review=True, issue_category="质量问题", source_type="sellersprite_review_export",
                    reviewed_at=datetime(2026, 7, 10),
                ),
                Review(
                    platform="Amazon", site_code="CA", store_name="加拿大店", asin="B0GROUP001",
                    product_title="Launcher", star_rating=5, review_content="Great", has_images=False,
                    is_negative_review=False, issue_category="待分类", source_type="sellersprite_review_export",
                    reviewed_at=datetime(2026, 7, 9),
                ),
            ])
            db.commit()

            result = list_reviews(view_mode="product", db=db)

        self.assertEqual(result["group_count"], 1)
        group = result["items"][0]
        self.assertEqual(group["review_count"], 2)
        self.assertEqual(group["negative_review_count"], 1)
        self.assertEqual(group["media_review_count"], 1)
        self.assertEqual(group["star_counts"], {"1": 1, "2": 0, "3": 0, "4": 0, "5": 1})
        self.assertEqual(group["source_types"], ["sellersprite_review_export"])

    def test_review_capture_queue_extracts_asin_and_site_from_amazon_urls(self):
        with self.session_factory() as db:
            admin = UserAccount(name="Admin", email="admin@example.com", password_hash="x", role="管理员")
            db.add(admin)
            db.commit()
            result = queue_review_captures(
                entries="https://www.amazon.ca/dp/B0CHJ55J9G?th=1\nhttps://www.amazon.co.uk/dp/B0ABC12345",
                db=db,
                _=admin,
            )
            queued = list_review_capture_jobs(db=db)

        self.assertEqual(result["created"], 2)
        self.assertEqual(result["invalid"], [])
        self.assertEqual([item["asin"] for item in queued["items"]], ["B0ABC12345", "B0CHJ55J9G"])
        self.assertEqual({item["site_code"] for item in queued["items"]}, {"CA", "UK"})
        self.assertTrue(all(item["status"] == "待本机采集" for item in queued["items"]))

    def test_import_reviews_and_generate_supplier_tasks(self):
        with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
            workbook_path = tmp.name

        df = pd.DataFrame(
            [
                {
                    "平台": "Amazon",
                    "站点": "US",
                    "店铺": "美国老店",
                    "ASIN": "B0TEST001",
                    "产品标题": "Test Product A",
                    "评论ID": "RV-001",
                    "星级": 1,
                    "评论标题": "Broken",
                    "评论内容": "Broke after two days.",
                    "评论图片": "https://img1",
                    "问题分类": "质量问题",
                    "情绪": "负面",
                    "是否反馈供应商": "N",
                    "整改状态": "待反馈",
                    "评论时间": "2026-07-01 10:20:00",
                },
                {
                    "平台": "Amazon",
                    "站点": "CA",
                    "店铺": "加拿大店",
                    "ASIN": "B0TEST002",
                    "产品标题": "Test Product B",
                    "评论ID": "RV-002",
                    "星级": 5,
                    "评论标题": "Good",
                    "评论内容": "Works great.",
                    "评论图片": "",
                    "问题分类": "其他",
                    "情绪": "正面",
                    "是否反馈供应商": "N",
                    "整改状态": "",
                    "评论时间": "2026-07-02 11:20:00",
                },
            ]
        )
        df.to_excel(workbook_path, index=False)

        with self.session_factory() as db:
            result = import_reviews_from_workbook(db, workbook_path, limit=10)
            db.commit()
            review_count = db.query(Review).count()
            task_result = generate_tasks_from_negative_reviews(db, limit=10)
            db.commit()
            task_count = db.query(SupplierTask).count()

        self.assertEqual(result["created"], 2)
        self.assertEqual(review_count, 2)
        self.assertEqual(task_result["created"], 1)
        self.assertEqual(task_count, 1)

    def test_second_review_import_in_one_transaction_updates_existing_reviews(self):
        with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
            workbook_path = tmp.name
        pd.DataFrame([{
            "平台": "Amazon", "站点": "US", "ASIN": "B0TEST001", "评论ID": "R-001",
            "星级": 1, "评论内容": "Broken", "评论时间": "2026-07-01",
        }]).to_excel(workbook_path, index=False)

        with self.session_factory() as db:
            first = import_reviews_from_workbook(db, workbook_path, limit=10)
            second = import_reviews_from_workbook(db, workbook_path, limit=10)
            db.commit()
            count = db.query(Review).count()

        self.assertEqual(first, {"created": 1, "updated": 0})
        self.assertEqual(second, {"created": 0, "updated": 1})
        self.assertEqual(count, 1)

    def test_review_quality_summary_flags_missing_review_fields(self):
        rows = [
            {
                "platform": "Amazon",
                "site_code": "US",
                "asin": None,
                "review_external_id": None,
                "review_url": None,
                "review_content": None,
                "star_rating": None,
                "is_negative_review": True,
                "issue_category": None,
            }
        ]

        summary = validate_review_rows(rows)

        self.assertEqual(summary["warning_rows"], 1)
        self.assertEqual(summary["issue_counts"]["missing_review_identifier"], 1)
        self.assertEqual(summary["issue_counts"]["missing_review_url"], 1)
        self.assertEqual(summary["issue_counts"]["missing_asin"], 1)
        self.assertEqual(summary["issue_counts"]["invalid_star_rating"], 1)

    def test_data_quality_summary_aggregates_database_state(self):
        with self.session_factory() as db:
            db.add(
                Review(
                    platform="Amazon",
                    site_code="US",
                    asin=None,
                    review_external_id="RV-100",
                    review_url=None,
                    review_content="bad",
                    star_rating=1,
                    is_negative_review=True,
                    issue_category=None,
                    source_type="manual_import",
                )
            )
            db.commit()
            summary = build_data_quality_summary(db)

        self.assertEqual(summary["reviews"]["total"], 1)
        self.assertEqual(summary["reviews"]["negative_total"], 1)
        self.assertEqual(summary["reviews"]["missing_review_url"], 1)
        self.assertEqual(summary["reviews"]["missing_asin"], 1)
        self.assertEqual(summary["reviews"]["missing_issue_category_on_negative"], 1)

    def test_review_timeline_serializer_includes_supplier_task_summary(self):
        review = Review(
            platform="Amazon",
            site_code="US",
            store_name="美国老店",
            asin="B0TEST001",
            product_title="Test Product A",
            review_external_id="RV-001",
            review_content="bad",
            review_title="bad",
            is_negative_review=True,
            issue_category="质量问题",
        )
        task = SupplierTask(
            task_code="SR-9001",
            asin="B0TEST001",
            product_title="Test Product A",
            supplier_name="Demo Supplier",
            issue_category="质量问题",
            status="pending_feedback",
            priority="high",
            notes="待给供应商建议方案",
        )

        payload = _serialize_review(review, task)

        self.assertEqual(payload["supplier_task_code"], "SR-9001")
        self.assertEqual(payload["supplier_task_status"], "pending_feedback")
        self.assertEqual(payload["supplier_name"], "Demo Supplier")
        self.assertEqual(payload["supplier_task_suggested_action"], None)

    def test_generate_supplier_task_sets_suggested_action(self):
        with tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False) as tmp:
            workbook_path = tmp.name

        pd.DataFrame(
            [
                {
                    "平台": "Amazon",
                    "站点": "US",
                    "店铺": "美国老店",
                    "ASIN": "B0TEST009",
                    "产品标题": "Test Product C",
                    "评论ID": "RV-009",
                    "星级": 1,
                    "评论标题": "Broken",
                    "评论内容": "Broken quickly.",
                    "问题分类": "质量问题",
                    "情绪": "负面",
                    "是否反馈供应商": "N",
                    "整改状态": "待反馈",
                    "评论时间": "2026-07-02 11:20:00",
                }
            ]
        ).to_excel(workbook_path, index=False)

        with self.session_factory() as db:
            import_reviews_from_workbook(db, workbook_path, limit=10)
            db.commit()
            generate_tasks_from_negative_reviews(db, limit=10)
            db.commit()
            task = db.query(SupplierTask).filter(SupplierTask.asin == "B0TEST009").one()

        self.assertIn("批次抽检", task.suggested_action or "")


if __name__ == "__main__":
    unittest.main()
