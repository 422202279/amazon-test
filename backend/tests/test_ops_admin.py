import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.routers.admin import get_security_settings, list_roles, list_users
from app.routers.ops import deployment_profile, source_capabilities


class OpsAdminTests(unittest.TestCase):
    def test_source_capabilities_marks_amazon_cloud_ready(self):
        payload = source_capabilities()

        self.assertEqual(len(payload["items"]), 3)
        amazon = next(item for item in payload["items"] if item["platform"] == "Amazon")
        self.assertTrue(amazon["cloud_ready"])
        self.assertEqual(amazon["automation_level"], "半自动")

    def test_deployment_profile_returns_minimum_server_guidance(self):
        payload = deployment_profile()

        self.assertEqual(payload["minimum_server"], "2核2G 云服务器即可")
        self.assertIn("FastAPI", payload["runtime"])
        self.assertTrue(payload["ssl_required"])

    def test_admin_users_and_roles_have_expected_shape(self):
        users = list_users()
        roles = list_roles()
        security = get_security_settings()

        self.assertGreaterEqual(users["total"], 4)
        self.assertEqual(users["items"][0]["role"], "管理员")
        self.assertGreaterEqual(len(roles["items"]), 3)
        self.assertEqual(security["deploy_mode"], "轻量后台即可")


if __name__ == "__main__":
    unittest.main()
