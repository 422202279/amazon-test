#!/usr/bin/env python3
"""Import all SellerSprite review exports in a local folder into the current database."""

import argparse
import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR / "backend"))

from app.database import Base, SessionLocal, engine
from app.models import ReviewCaptureJob  # Ensure the queue table is registered before create_all.
from app.services.review_batch_import import import_review_exports_from_directory


def main() -> None:
    parser = argparse.ArgumentParser(description="批量导入卖家精灵评论导出文件")
    parser.add_argument("--dir", default=str(Path.home() / "Downloads"), help="评论 .xlsx 文件所在目录")
    parser.add_argument("--limit", type=int, default=5000, help="每个文件最多导入的评论行数")
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        result = import_review_exports_from_directory(db, args.dir, args.limit)
        db.commit()
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
