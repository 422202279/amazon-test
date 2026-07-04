from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent
DEFAULT_DATA_DIR = PROJECT_ROOT / "data"
DEFAULT_SAMPLE_DATA_DIR = PROJECT_ROOT / "sample-data"


def _sqlite_url(path: Path) -> str:
    return f"sqlite:///{path.resolve().as_posix()}"


def sqlite_path_from_url(url: str) -> Path | None:
    if not url.startswith("sqlite:///"):
        return None
    raw = url.removeprefix("sqlite:///")
    if raw.startswith(".//"):
        return Path("/" + raw.removeprefix(".//")).resolve()
    if raw.startswith("/"):
        return Path(raw)
    return (PROJECT_ROOT / raw).resolve()


class Settings(BaseSettings):
    app_name: str = "CrossBorder Store Review Monitor Lite"
    app_env: str = "local"
    api_prefix: str = "/api"
    database_url: str = _sqlite_url(DEFAULT_DATA_DIR / "crossborder_monitor.db")
    upload_dir: Path = DEFAULT_DATA_DIR / "uploads"
    export_dir: Path = DEFAULT_DATA_DIR / "exports"
    backup_dir: Path = DEFAULT_DATA_DIR / "backups"
    sample_data_dir: Path = DEFAULT_SAMPLE_DATA_DIR
    default_schedule_times: str = "06:00"
    max_schedule_times: int = 3

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
