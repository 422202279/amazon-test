import sys
import unittest
from pathlib import Path
from unittest.mock import patch

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import Base
from app.models.user_account import UserAccount
from app.routers.ops import UrlProductCapturePayload, url_product_import, url_product_preview
from app.security import ensure_default_admin
from app.services.source_capture import preview_product_from_url


AMAZON_HTML = """
<html>
  <head>
    <title>Demo Amazon Product</title>
    <meta property="og:title" content="Memory Foam Seat Cushion" />
    <meta property="og:image" content="https://images.example.com/seat.jpg" />
    <link rel="canonical" href="https://www.amazon.com/dp/B0TESTA123" />
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Memory Foam Seat Cushion",
        "sku": "CUS-100",
        "brand": {"@type": "Brand", "name": "PetMoment"},
        "image": ["https://images.example.com/seat.jpg"],
        "aggregateRating": {"@type": "AggregateRating", "ratingValue": "4.4", "reviewCount": "128"},
        "offers": {"@type": "Offer", "priceCurrency": "USD", "price": "29.99"}
      }
    </script>
  </head>
  <body>
    <span id="productTitle">Memory Foam Seat Cushion</span>
    <a id="bylineInfo">PetMoment</a>
    <span id="acrCustomerReviewText">128 ratings</span>
    <span id="acrPopover" title="4.4 out of 5 stars"></span>
  </body>
</html>
"""


NAVER_HTML = """
<html>
  <head>
    <meta property="og:title" content="Naver Pet Bed" />
    <meta property="og:image" content="https://images.example.com/bed.jpg" />
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Naver Pet Bed",
        "brand": "PetMoment KR",
        "image": ["https://images.example.com/bed.jpg"],
        "aggregateRating": {"ratingValue": "4.8", "reviewCount": "19"},
        "offers": {"priceCurrency": "KRW", "price": "35900"}
      }
    </script>
  </head>
</html>
"""


class SourceCaptureTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        self.session_factory = sessionmaker(bind=self.engine, autoflush=False, autocommit=False)
        Base.metadata.create_all(bind=self.engine)

    def test_preview_product_from_amazon_url_extracts_core_fields(self):
        item = preview_product_from_url("https://www.amazon.com/dp/B0TESTA123", html=AMAZON_HTML)

        self.assertEqual(item["platform"], "Amazon")
        self.assertEqual(item["site_code"], "US")
        self.assertEqual(item["asin"], "B0TESTA123")
        self.assertEqual(item["title"], "Memory Foam Seat Cushion")
        self.assertEqual(item["brand"], "PetMoment")
        self.assertEqual(item["price_currency"], "USD")
        self.assertEqual(item["review_count"], 128)
        self.assertEqual(item["rating"], 4.4)

    def test_preview_product_from_naver_url_extracts_kr_fields(self):
        item = preview_product_from_url("https://smartstore.naver.com/petmoment-kr/products/12176956328", html=NAVER_HTML)

        self.assertEqual(item["platform"], "Naver")
        self.assertEqual(item["site_code"], "KR")
        self.assertEqual(item["title"], "Naver Pet Bed")
        self.assertEqual(item["price_currency"], "KRW")
        self.assertEqual(item["review_count"], 19)

    @patch("app.routers.ops.preview_product_from_url")
    def test_url_product_preview_applies_manual_overrides(self, mock_preview):
        mock_preview.return_value = {"platform": "Amazon", "site_code": "US", "title": "Demo", "capture_status": "ok"}

        result = url_product_preview(
            UrlProductCapturePayload(
                url="https://www.amazon.com/dp/B0TESTA123",
                store_name="US Home Store",
                supplier_name="宁波工厂",
                supplier_factory="一厂",
            )
        )

        self.assertEqual(result["item"]["store_name"], "US Home Store")
        self.assertEqual(result["item"]["supplier_name"], "宁波工厂")
        self.assertEqual(result["item"]["supplier_factory"], "一厂")

    @patch("app.routers.ops.preview_product_from_url")
    def test_url_product_import_creates_and_updates_product(self, mock_preview):
        mock_preview.return_value = {
            "platform": "Amazon",
            "site_code": "US",
            "title": "Demo Product",
            "asin": "B0TESTA123",
            "product_url": "https://www.amazon.com/dp/B0TESTA123",
            "price_amount": 29.99,
            "price_currency": "USD",
            "capture_status": "ok",
            "capture_note": "ok",
        }

        with self.session_factory() as db:
            ensure_default_admin(db)
            admin_user = db.query(UserAccount).filter(UserAccount.email == "admin@cb-monitor.local").one()
            created = url_product_import(
                UrlProductCapturePayload(url="https://www.amazon.com/dp/B0TESTA123", store_name="US Home Store"),
                db=db,
                _=admin_user,
            )
            mock_preview.return_value["title"] = "Demo Product Updated"
            updated = url_product_import(
                UrlProductCapturePayload(url="https://www.amazon.com/dp/B0TESTA123", store_name="US Home Store"),
                db=db,
                _=admin_user,
            )

        self.assertEqual(created["action"], "created")
        self.assertEqual(updated["action"], "updated")
        self.assertEqual(updated["item"]["title"], "Demo Product Updated")


if __name__ == "__main__":
    unittest.main()
