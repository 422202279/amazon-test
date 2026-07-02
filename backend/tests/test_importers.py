import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.product import Product
from app.models.product_metric import ProductMetricHistory
from app.models.store import Store
from app.services.product_importer import (
    import_internal_store_products,
    import_sellersprite_products,
    import_internal_store_links,
    import_sellersprite_sales_history,
    preview_internal_store_links,
    preview_sellersprite_sales_history,
)


INTERNAL_WORKBOOK = "/Users/jcc_mac/Documents/A新禾亚马逊一部/产品信息汇总表 新系统一些SKU加点版本_在售版本汇总.xlsx"
SELLERSPRITE_HISTORY_WORKBOOK = "/Users/jcc_mac/Downloads/product-CA-sales-20260702-71124.xlsx"


class ImporterTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        self.session_factory = sessionmaker(bind=self.engine, autoflush=False, autocommit=False)
        Base.metadata.create_all(bind=self.engine)

    def test_internal_store_links_cover_amazon_and_korea(self):
        rows = preview_internal_store_links(INTERNAL_WORKBOOK)

        self.assertGreaterEqual(len(rows), 9)

        platforms = {row["platform"] for row in rows}
        self.assertIn("Amazon", platforms)
        self.assertIn("Coupang", platforms)
        self.assertIn("Naver", platforms)

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


if __name__ == "__main__":
    unittest.main()
