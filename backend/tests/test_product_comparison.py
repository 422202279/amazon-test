import sys
import unittest
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import Base
from app.models.product import Product
from app.models.review import Review
from app.routers.products import _serialize_product, compare_products


class ProductComparisonTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        self.session_factory = sessionmaker(bind=self.engine, autoflush=False, autocommit=False)
        Base.metadata.create_all(bind=self.engine)

    def test_listing_review_count_does_not_become_zero_negative_rate(self):
        with self.session_factory() as db:
            db.add(
                Product(
                    platform="Amazon",
                    site_code="US",
                    store_name="美国新店",
                    asin="B0COMPARE1",
                    title="Real Listing Snapshot",
                    review_count=42,
                )
            )
            db.commit()

            payload = compare_products(asins="B0COMPARE1", db=db)

        item = payload["items"][0]
        self.assertEqual(item["review_total"], 42)
        self.assertIsNone(item["negative_ratio"])
        self.assertEqual(item["review_data_status"], "missing")

    def test_imported_reviews_enable_negative_rate_and_issue_comparison(self):
        with self.session_factory() as db:
            db.add(
                Product(
                    platform="Amazon",
                    site_code="US",
                    store_name="美国新店",
                    asin="B0COMPARE2",
                    title="Real Review Evidence",
                    review_count=42,
                )
            )
            db.add(
                Review(
                    platform="Amazon",
                    site_code="US",
                    store_name="美国新店",
                    asin="B0COMPARE2",
                    product_title="Real Review Evidence",
                    review_external_id="RV-COMPARE-1",
                    review_content="Broke after one day.",
                    star_rating=1,
                    is_negative_review=True,
                    has_images=True,
                    issue_category="质量问题",
                    source_type="excel_import",
                )
            )
            db.commit()

            payload = compare_products(asins="B0COMPARE2", db=db)

        item = payload["items"][0]
        self.assertEqual(item["review_total"], 1)
        self.assertEqual(item["negative_ratio"], 100.0)
        self.assertEqual(item["review_data_status"], "available")
        self.assertEqual(item["top_issue_summary"], "质量问题")

    def test_product_serializer_marks_missing_fields_with_source_reason(self):
        product = Product(
            platform="Amazon",
            site_code="UK",
            asin="B0FIELDS01",
            title="Source-backed Product",
            product_url="https://www.amazon.co.uk/dp/B0FIELDS01",
            source_file="internal-products.xlsx",
        )

        payload = _serialize_product(product)

        self.assertTrue(payload["field_availability"]["title"]["available"])
        self.assertFalse(payload["field_availability"]["image_url"]["available"])
        self.assertEqual(payload["field_availability"]["image_url"]["reason"], "当前导入来源未提供该字段")
        self.assertEqual(payload["field_availability"]["image_url"]["source"], "internal-products.xlsx")


if __name__ == "__main__":
    unittest.main()
