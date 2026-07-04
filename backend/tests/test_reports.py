import sys
import unittest
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import Base
from app.models.product import Product
from app.models.review import Review
from app.models.supplier_task import SupplierTask
from app.models.user_account import UserAccount
from app.routers.reports import ReportPayload, create_report, export_report_markdown, list_reports
from app.security import ensure_default_admin


class ReportTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        self.session_factory = sessionmaker(bind=self.engine, autoflush=False, autocommit=False)
        Base.metadata.create_all(bind=self.engine)
        with self.session_factory() as db:
            ensure_default_admin(db)
            db.add(Product(platform="Amazon", site_code="US", title="Report Product", asin="B0REPORT1"))
            db.add(Review(platform="Amazon", site_code="US", product_title="Report Product", star_rating=2, is_negative_review=True, review_title="Bad"))
            db.add(SupplierTask(task_code="SR-RPT-1", product_title="Report Product", status="pending_feedback", priority="high"))
            db.commit()

    def _admin(self, db):
        return db.query(UserAccount).filter(UserAccount.email == "admin@cb-monitor.local").one()

    def test_create_and_export_report(self):
        with self.session_factory() as db:
            admin = self._admin(db)
            created = create_report(
                ReportPayload(report_type="产品评论分析", title="测试报告", scope="全部店铺"),
                db=db,
                _=admin,
            )
            items = list_reports(db=db)
            exported = export_report_markdown(created["id"], db=db)

        self.assertEqual(created["title"], "测试报告")
        self.assertEqual(len(items["items"]), 1)
        self.assertIn("测试报告", exported.body.decode("utf-8"))


if __name__ == "__main__":
    unittest.main()
