from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env:     str = Field(default="development", alias="APP_ENV")
    log_level:   str = Field(default="INFO",        alias="LOG_LEVEL")
    database_url:    str = Field(default="",        alias="DATABASE_URL")
    supabase_url:    str = Field(default="",        alias="SUPABASE_URL")
    supabase_key:    str = Field(default="",        alias="SUPABASE_KEY")
    football_data_api_token: str = Field(default="", alias="FOOTBALL_DATA_API_TOKEN")
    allowed_origins: str = Field(
        default="http://localhost:3000", alias="ALLOWED_ORIGINS"
    )

    # Auth
    jwt_secret:       str = Field(
        default="change-this-secret-in-production", alias="JWT_SECRET"
    )
    jwt_expire_hours: int  = Field(default=24, alias="JWT_EXPIRE_HOURS")
    admin_username:   str  = Field(default="admin", alias="ADMIN_USERNAME")
    admin_password:   str  = Field(default="football2024", alias="ADMIN_PASSWORD")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
