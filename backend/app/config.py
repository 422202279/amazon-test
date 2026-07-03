from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CrossBorder Store Review Monitor Lite"
    app_env: str = "local"
    api_prefix: str = "/api"
    database_url: str = "sqlite:///./data/crossborder_monitor.db"
    upload_dir: Path = Path("data/uploads")
    export_dir: Path = Path("data/exports")
    backup_dir: Path = Path("data/backups")
    sample_data_dir: Path = Path("../sample-data")
    default_schedule_times: str = "06:00"
    max_schedule_times: int = 3

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
