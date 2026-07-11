import sys
import tempfile
import unittest
import hashlib
from pathlib import Path
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import settings
from app.database import Base
from app.main import create_app
from app.models.user_account import UserAccount
from app.routers.health import health_detail
from app.routers.admin import (
    UserPayload,
    create_user,
    get_security_settings,
    list_roles,
    list_users,
    update_user,
)
from app.routers.auth import ChangePasswordPayload, LoginPayload, change_password, login, me
from app.routers.ops import create_backup, deployment_profile, list_backups, live_validation, restore_backup, source_capabilities
from app.security import TOKEN_STORE, ensure_default_admin, get_current_user


class OpsAdminTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        self.session_factory = sessionmaker(bind=self.engine, autoflush=False, autocommit=False)
        Base.metadata.create_all(bind=self.engine)

    def test_source_capabilities_marks_amazon_cloud_ready(self):
        payload = source_capabilities()

        self.assertEqual(len(payload["items"]), 3)
        amazon = next(item for item in payload["items"] if item["platform"] == "Amazon")
        self.assertTrue(amazon["cloud_ready"])
        self.assertEqual(amazon["automation_level"], "半自动")

    def test_application_serves_static_frontend_from_same_origin(self):
        app = create_app()

        self.assertTrue(any(route.name == "frontend" for route in app.routes))

    def test_deployment_profile_returns_minimum_server_guidance(self):
        payload = deployment_profile()

        self.assertEqual(payload["minimum_server"], "2核2G 云服务器即可")
        self.assertIn("FastAPI", payload["runtime"])
        self.assertTrue(payload["ssl_required"])

    def test_admin_users_and_roles_have_expected_shape(self):
        with self.session_factory() as db:
          ensure_default_admin(db)
          admin_user = db.query(UserAccount).filter(UserAccount.email == "admin@cb-monitor.local").one()
          users = list_users(db=db, _=admin_user)
          roles = list_roles(_=admin_user)
          security = get_security_settings(_=admin_user)

        self.assertGreaterEqual(users["total"], 1)
        self.assertEqual(users["items"][0]["role"], "管理员")
        self.assertGreaterEqual(len(roles["items"]), 3)
        self.assertEqual(security["deploy_mode"], "轻量后台即可")

    def test_login_and_me_work_for_default_admin(self):
        with self.session_factory() as db:
            ensure_default_admin(db)
            payload = login(LoginPayload(email="admin@cb-monitor.local", password="admin123456"), db=db)
            admin_user = db.query(UserAccount).filter(UserAccount.email == "admin@cb-monitor.local").one()
            me_payload = me(user=admin_user)

        self.assertIn("token", payload)
        self.assertNotIn("default_password_notice", payload)
        self.assertEqual(me_payload["email"], "admin@cb-monitor.local")

    def test_session_remains_valid_after_in_memory_cache_is_cleared(self):
        with self.session_factory() as db:
            ensure_default_admin(db)
            payload = login(LoginPayload(email="admin@cb-monitor.local", password="admin123456"), db=db)
            TOKEN_STORE.clear()

            current_user = get_current_user(
                authorization=f"Bearer {payload['token']}",
                db=db,
            )

        self.assertEqual(current_user.email, "admin@cb-monitor.local")

    def test_password_change_clears_first_login_requirement(self):
        with self.session_factory() as db:
            ensure_default_admin(db)
            admin_user = db.query(UserAccount).filter(UserAccount.email == "admin@cb-monitor.local").one()
            self.assertTrue(admin_user.must_change_password)

            changed = change_password(
                ChangePasswordPayload(current_password="admin123456", new_password="NewStrongPass123"),
                db=db,
                user=admin_user,
            )
            payload = login(LoginPayload(email="admin@cb-monitor.local", password="NewStrongPass123"), db=db)

        self.assertTrue(changed["ok"])
        self.assertFalse(payload["user"]["must_change_password"])

    def test_legacy_default_admin_hash_is_migrated_once(self):
        legacy_hash = hashlib.sha256(b"cb-monitor-lite-local:admin123456").hexdigest()
        with self.session_factory() as db:
            db.add(
                UserAccount(
                    name="系统管理员",
                    email="admin@cb-monitor.local",
                    password_hash=legacy_hash,
                    role="管理员",
                    status="启用",
                )
            )
            db.commit()
            ensure_default_admin(db)
            payload = login(LoginPayload(email="admin@cb-monitor.local", password="admin123456"), db=db)

        self.assertTrue(payload["user"]["must_change_password"])

    def test_create_and_update_user(self):
        with self.session_factory() as db:
            ensure_default_admin(db)
            admin_user = db.query(UserAccount).filter(UserAccount.email == "admin@cb-monitor.local").one()
            created = create_user(
                UserPayload(
                    name="测试账号",
                    email="tester@example.com",
                    role="运营",
                    scope="产品 / 评论",
                    stores=["US Home Store"],
                    status="启用",
                    password="12345678",
                ),
                db=db,
                _=admin_user,
            )
            updated = update_user(
                created["id"],
                UserPayload(
                    name="测试账号2",
                    email="tester@example.com",
                    role="产品开发",
                    scope="产品 / 评论 / 整改",
                    stores=["CA Comfort"],
                    status="启用",
                    password="87654321",
                ),
                db=db,
                _=admin_user,
            )

        self.assertEqual(created["email"], "tester@example.com")
        self.assertEqual(updated["name"], "测试账号2")
        self.assertEqual(updated["role"], "产品开发")

    @patch("app.routers.ops.preview_internal_store_links")
    @patch("app.routers.ops.preview_sellersprite_products")
    @patch("app.routers.ops.preview_internal_store_products")
    def test_live_validation_returns_preview_samples(
        self,
        mock_internal_products,
        mock_sellersprite_products,
        mock_store_links,
    ):
        mock_internal_products.return_value = [{"asin": "B0TEST001", "title": "Internal Item", "store_name": "UK Store"}]
        mock_sellersprite_products.return_value = [{"asin": "B0TEST002", "title": "Sprite Item", "store_name": "CA Store"}]
        mock_store_links.return_value = [{"platform": "Amazon", "site_code": "UK", "store_name": "UK Store", "store_page_url": "https://example.com"}]

        payload = live_validation()

        self.assertEqual(payload["internal_products"][0]["asin"], "B0TEST001")
        self.assertEqual(payload["sellersprite_products"][0]["asin"], "B0TEST002")
        self.assertEqual(payload["store_links"][0]["site_code"], "UK")
        self.assertEqual(payload["http_checks"][0]["code"], 200)

    def test_health_detail_exposes_directories(self):
        payload = health_detail()

        self.assertTrue(payload["ok"])
        self.assertIn("backup_dir", payload)
        self.assertIn("export_dir", payload)

    def test_backup_endpoints_work_for_sqlite(self):
        with self.session_factory() as db:
            ensure_default_admin(db)
            admin_user = db.query(UserAccount).filter(UserAccount.email == "admin@cb-monitor.local").one()

        with tempfile.TemporaryDirectory() as tmp_dir:
            db_path = Path(tmp_dir) / "test.sqlite3"
            db_path.write_text("backup-smoke", encoding="utf-8")
            backup_dir = Path(tmp_dir) / "backups"
            with patch.object(settings, "database_url", f"sqlite:///./{db_path}"), patch.object(settings, "backup_dir", backup_dir):
                created = create_backup(_=admin_user)
                listed = list_backups(_=admin_user)

        self.assertTrue(created["created"])
        self.assertGreaterEqual(len(listed["items"]), 1)

    def test_restore_backup_replaces_sqlite_file(self):
        with self.session_factory() as db:
            ensure_default_admin(db)
            admin_user = db.query(UserAccount).filter(UserAccount.email == "admin@cb-monitor.local").one()

        with tempfile.TemporaryDirectory() as tmp_dir:
            db_path = Path(tmp_dir) / "test.sqlite3"
            backup_dir = Path(tmp_dir) / "backups"
            backup_dir.mkdir(parents=True, exist_ok=True)
            db_path.write_text("old-db", encoding="utf-8")
            (backup_dir / "demo.sqlite3").write_text("new-db", encoding="utf-8")

            with patch.object(settings, "database_url", f"sqlite:///./{db_path}"), patch.object(settings, "backup_dir", backup_dir):
                restored = restore_backup("demo.sqlite3", _=admin_user)

            self.assertTrue(restored["restored"])
            self.assertEqual(db_path.read_text(encoding="utf-8"), "new-db")


if __name__ == "__main__":
    unittest.main()
