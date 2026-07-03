import sys
import tempfile
import unittest
from pathlib import Path

import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import Base
from app.services.data_quality import build_data_quality_summary, validate_review_rows
from app.models.review import Review
from app.models.supplier_task import SupplierTask
from app.services.review_importer import (
    import_reviews_from_workbook,
    preview_reviews_from_workbook,
)
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


if __name__ == "__main__":
    unittest.main()
