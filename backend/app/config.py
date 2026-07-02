from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CrossBorder Store Review Monitor Lite"
    app_env: str = "local"
    api_prefix: str = "/api"
    database_url: str = "sqlite:///./data/crossborder_monitor.db"
    upload_dir: Path = Path("data/uploads")
    export_dir: Path = Path("data/exports")
    sample_data_dir: Path = Path("../sample-data")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
