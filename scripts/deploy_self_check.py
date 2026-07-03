import json
import urllib.request


BASE = "http://127.0.0.1:8000/api"


def req(path: str) -> dict:
    with urllib.request.urlopen(f"{BASE}{path}", timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def main() -> int:
    health = req("/health")
    detail = req("/health/detail")
    result = {
        "health_ok": health.get("ok"),
        "app": health.get("app"),
        "env": health.get("env"),
        "database_exists": detail.get("database_exists"),
        "database_path": detail.get("database_path"),
        "upload_dir": detail.get("upload_dir"),
        "export_dir": detail.get("export_dir"),
        "backup_dir": detail.get("backup_dir"),
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
