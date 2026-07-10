import unittest
from pathlib import Path


APP_JS = Path(__file__).resolve().parents[2] / "prototype" / "app.js"


class FrontendPhase0Contracts(unittest.TestCase):
    def setUp(self):
        self.source = APP_JS.read_text(encoding="utf-8")

    def test_api_uses_same_origin_by_default(self):
        self.assertIn('window.__API_BASE__ || "/api"', self.source)
        self.assertNotIn('const API_BASE = "http://127.0.0.1:8000/api"', self.source)

    def test_store_filters_use_a_separate_complete_store_registry(self):
        self.assertIn("let allStores", self.source)
        self.assertIn("allStores\n    .filter", self.source)

    def test_empty_api_results_clear_product_and_review_tables(self):
        self.assertIn("products = (data.items || [])", self.source)
        self.assertIn("reviews = mode === \"product\" ? (data.items || [])", self.source)
        self.assertNotIn("fallback to mock data", self.source)


if __name__ == "__main__":
    unittest.main()
