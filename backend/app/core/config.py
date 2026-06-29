from typing import List, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import json


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
        case_sensitive=True,
    )

    # Project Info
    PROJECT_NAME: str = "Shop Hub"
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = "CHANGE_ME_PLEASE_SET_IN_ENV"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    ADMIN_REGISTRATION_CODE: str = "SECRET_ADMIN_CODE_123"

    # Database — Supabase PostgreSQL connection string
    # Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
    DATABASE_URL: Optional[str] = None
    # Set to true only for local dev without Supabase (uses SQLite shophub.db)
    USE_SQLITE_FALLBACK: bool = False

    # Supabase (optional — for Storage / future features)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_SECRET_KEY: Optional[str] = None

    # Gemini AI
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # CORS Settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, ValueError):
                return [origin.strip() for origin in v.split(",")]
        return v

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> Optional[str]:
        return self.normalized_database_url

    @property
    def normalized_database_url(self) -> Optional[str]:
        """Ensure SQLAlchemy uses psycopg2 driver for PostgreSQL."""
        if not self.DATABASE_URL:
            return None
        url = self.DATABASE_URL.strip()
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        if url.startswith("postgresql://") and "+psycopg" not in url:
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url

    # Server Settings
    DEBUG: bool = True
    SERVER_NAME: str = "localhost"
    SERVER_PORT: int = 8000


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
