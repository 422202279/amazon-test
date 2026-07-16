import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.import_job import ImportJob
from app.models.product import Product
from app.models.product_metric import ProductMetricHistory
from app.models.store import Store
from app.services.data_quality import validate_product_rows
from app.services.import_jobs import create_import_job
from app.services.product_importer import (
    preview_company_master_products,
    import_company_master_products,
    import_internal_store_products,
    import_sellersprite_products,
    import_internal_store_links,
    import_sellersprite_sales_history,
    preview_internal_store_links,
    preview_sellersprite_products,
    preview_sellersprite_sales_history,
)
from app.services.query_helpers import split_identifier_terms


INTERNAL_WORKBOOK = "/Users/jcc_mac/Documents/A新禾亚马逊一部/产品信息汇总表 新系统一些SKU加点版本_在售版本汇总.xlsx"
SELLERSPRITE_HISTORY_WORKBOOK = "/Users/jcc_mac/Downloads/product-CA-sales-20260702-71124.xlsx"
SELLERSPRITE_UK_WORKBOOK = "/Users/jcc_mac/Documents/Codex项目/卖家精灵原始数据汇总/新禾亚马逊一部店铺产品卖家精灵数据/20260703/Product-UK-20260703.xlsx"
COMPANY_MASTER_WORKBOOK = "/Users/jcc_mac/Documents/A新禾亚马逊一部/亚马逊一部亚马逊总产品表.xlsx"


class ImporterTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        self.session_factory = sessionmaker(bind=self.engine, autoflush=False, autocommit=False)
        Base.metadata.create_all(bind=self.engine)

    def test_internal_store_links_reflect_current_source_workbook_coverage(self):
        rows = preview_internal_store_links(INTERNAL_WORKBOOK)

        self.assertGreaterEqual(len(rows), 9)

        platforms = {row["platform"] for row in rows}
        self.assertIn("Amazon", platforms)
        self.assertIn("Coupang", platforms)
        # The provided workbook has no Naver store row. Do not invent one during import.
        self.assertNotIn("Naver", platforms)

        coupang = next(row for row in rows if row["platform"] == "Coupang")
        self.assertEqual(coupang["site_code"], "KR")
        self.assertIn("coupang.com", coupang["store_page_url"])

    def test_sellersprite_sales_history_extracts_monthly_metrics(self):
        rows = preview_sellersprite_sales_history(SELLERSPRITE_HISTORY_WORKBOOK, limit=4)

        self.assertGreaterEqual(len(rows), 4)
        first = rows[0]

        self.assertEqual(first["platform"], "Amazon")
        self.assertEqual(first["site_code"], "CA")
        self.assertIn(first["metric_type"], {"monthly_sales", "monthly_revenue", "monthly_price"})
        self.assertIsNotNone(first["metric_month"])
        self.assertIsNotNone(first["asin"])

    def test_sellersprite_non_ca_currency_columns_are_imported(self):
        row = preview_sellersprite_products(SELLERSPRITE_UK_WORKBOOK, limit=1)[0]

        self.assertEqual(row["site_code"], "UK")
        self.assertEqual(row["price_currency"], "GBP")
        self.assertIsNotNone(row["price_amount"])

    def test_import_internal_store_links_persists_store_rows(self):
        with self.session_factory() as db:
            result = import_internal_store_links(db, INTERNAL_WORKBOOK)
            db.commit()
            store_count = db.query(Store).count()

        self.assertGreaterEqual(result["created"], 9)
        self.assertEqual(store_count, result["created"] + result["updated"])

    def test_import_sales_history_persists_metric_rows(self):
        with self.session_factory() as db:
            result = import_sellersprite_sales_history(db, SELLERSPRITE_HISTORY_WORKBOOK, limit=8)
            db.commit()
            metric_count = db.query(ProductMetricHistory).count()

        self.assertGreaterEqual(result["created"], 8)
        self.assertEqual(metric_count, result["created"] + result["updated"])

    def test_import_internal_products_persists_product_rows(self):
        with self.session_factory() as db:
            result = import_internal_store_products(db, INTERNAL_WORKBOOK, limit=5)
            db.commit()
            product_count = db.query(Product).count()

        self.assertGreaterEqual(result["created"], 5)
        self.assertEqual(product_count, result["created"] + result["updated"])

    def test_import_sellersprite_products_persists_product_rows(self):
        with self.session_factory() as db:
            result = import_sellersprite_products(db, "/Users/jcc_mac/Downloads/Product-CA-20260702.xlsx", limit=5)
            db.commit()
            product_count = db.query(Product).count()

        self.assertGreaterEqual(result["created"], 5)
        self.assertEqual(product_count, result["created"] + result["updated"])

    def test_company_master_preserves_multisite_product_data(self):
        rows = preview_company_master_products(COMPANY_MASTER_WORKBOOK, limit=200)

        self.assertEqual(len(rows), 200)
        self.assertEqual({row["site_code"] for row in rows}, {"US", "UK", "DE", "JP", "FR", "CA"})
        canada = next(row for row in rows if row["asin"] == "B0CHJ55J9G" and row["site_code"] == "CA")
        self.assertEqual(canada["store_name"], "加拿大")
        self.assertIsNotNone(canada["title"])
        self.assertIsNotNone(canada["product_url"])

        with self.session_factory() as db:
            result = import_company_master_products(db, COMPANY_MASTER_WORKBOOK, limit=200)
            db.commit()
            product_count = db.query(Product).count()

        self.assertEqual(product_count, 200)
        self.assertEqual(result["created"], 200)

    def test_product_quality_summary_flags_missing_identifiers(self):
        rows = [
            {
                "platform": "Amazon",
                "site_code": "US",
                "title": "Test Product",
                "asin": None,
                "sku": None,
                "department_item_no": None,
                "product_url": None,
                "rating": 6.2,
                "monthly_sales": 10,
                "review_count": 3,
            }
        ]

        summary = validate_product_rows(rows)

        self.assertEqual(summary["warning_rows"], 1)
        self.assertEqual(summary["issue_counts"]["missing_identifier"], 1)
        self.assertEqual(summary["issue_counts"]["missing_product_url"], 1)
        self.assertEqual(summary["issue_counts"]["invalid_rating"], 1)

    def test_create_import_job_persists_warning_summary(self):
        with self.session_factory() as db:
            job = create_import_job(
                db,
                import_type="internal_store_products",
                source_name="demo.xlsx",
                total_rows=5,
                success_rows=5,
                warning_rows=2,
                issue_summary={"issue_counts": {"missing_product_url": 2}},
            )
            db.commit()
            saved = db.query(ImportJob).filter(ImportJob.id == job.id).one()

        self.assertEqual(saved.status, "warning")
        self.assertEqual(saved.total_rows, 5)
        self.assertEqual(saved.success_rows, 5)
        self.assertEqual(saved.failed_rows, 0)
        self.assertIn("missing_product_url", saved.error_summary)

    def test_split_identifier_terms_accepts_multiple_delimiters(self):
        terms = split_identifier_terms("B0AAA11111, SKU-1，SKU-2\nB0AAA11111  SKU-3")
        self.assertEqual(terms, ["B0AAA11111", "SKU-1", "SKU-2", "SKU-3"])


if __name__ == "__main__":
    unittest.main()
