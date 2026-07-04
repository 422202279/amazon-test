import sys
import unittest
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import Base
from app.routers.stores import StorePayload, create_store, delete_store, update_store
from app.models.user_account import UserAccount
from app.routers.products import ProductPayload, create_product, delete_product, update_product
from app.routers.reviews import ReviewPayload, create_review, delete_review, update_review
from app.routers.supplier_tasks import (
    SupplierTaskPayload,
    create_supplier_task,
    delete_supplier_task,
    update_supplier_task,
)
from app.security import ensure_default_admin


class CrudFlowTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        self.session_factory = sessionmaker(bind=self.engine, autoflush=False, autocommit=False)
        Base.metadata.create_all(bind=self.engine)
        with self.session_factory() as db:
            ensure_default_admin(db)

    def _admin(self, db):
        return db.query(UserAccount).filter(UserAccount.email == "admin@cb-monitor.local").one()

    def test_product_crud_flow(self):
        with self.session_factory() as db:
            admin = self._admin(db)
            created = create_product(
                ProductPayload(platform="Amazon", site_code="US", title="Test Product", store_name="US Home Store", asin="B0CRUD001"),
                db=db,
                _=admin,
            )
            updated = update_product(
                created["id"],
                ProductPayload(platform="Amazon", site_code="US", title="Updated Product", store_name="US Home Store", asin="B0CRUD001"),
                db=db,
                _=admin,
            )
            deleted = delete_product(created["id"], db=db, _=admin)

        self.assertEqual(created["title"], "Test Product")
        self.assertEqual(updated["title"], "Updated Product")
        self.assertTrue(deleted["ok"])

    def test_store_crud_flow(self):
        with self.session_factory() as db:
            admin = self._admin(db)
            created = create_store(
                StorePayload(name="KR Pet Store", platform="Naver", site_code="KR", seller_identifier="petmoment-kr"),
                db=db,
                _=admin,
            )
            updated = update_store(
                created["id"],
                StorePayload(name="KR Pet Store Updated", platform="Naver", site_code="KR", seller_identifier="petmoment-kr"),
                db=db,
                _=admin,
            )
            deleted = delete_store(created["id"], db=db, _=admin)

        self.assertEqual(created["name"], "KR Pet Store")
        self.assertEqual(updated["name"], "KR Pet Store Updated")
        self.assertTrue(deleted["ok"])

    def test_review_crud_flow(self):
        with self.session_factory() as db:
            admin = self._admin(db)
            created = create_review(
                ReviewPayload(platform="Amazon", site_code="US", product_title="Review Product", star_rating=2, review_title="Too bad"),
                db=db,
                _=admin,
            )
            updated = update_review(
                created["id"],
                ReviewPayload(platform="Amazon", site_code="US", product_title="Review Product", star_rating=4, review_title="Improved"),
                db=db,
                _=admin,
            )
            deleted = delete_review(created["id"], db=db, _=admin)

        self.assertEqual(created["review_title"], "Too bad")
        self.assertEqual(updated["star_rating"], 4)
        self.assertTrue(deleted["ok"])

    def test_supplier_task_crud_flow(self):
        with self.session_factory() as db:
            admin = self._admin(db)
            created = create_supplier_task(
                SupplierTaskPayload(task_code="SR-CRUD-1", product_title="Task Product", status="pending_feedback", priority="medium"),
                db=db,
                _=admin,
            )
            updated = update_supplier_task(
                created["id"],
                SupplierTaskPayload(task_code="SR-CRUD-1", product_title="Task Product 2", status="in_progress", priority="high"),
                db=db,
                _=admin,
            )
            deleted = delete_supplier_task(created["id"], db=db, _=admin)

        self.assertEqual(created["task_code"], "SR-CRUD-1")
        self.assertEqual(updated["status"], "in_progress")
        self.assertTrue(deleted["ok"])


if __name__ == "__main__":
    unittest.main()
