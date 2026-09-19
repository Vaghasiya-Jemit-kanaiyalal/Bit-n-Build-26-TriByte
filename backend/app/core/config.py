import json
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "WasteWise AI"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/wastewise"
    TEST_DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/wastewise_test"

    # JWT Settings
    JWT_SECRET_KEY: str = "change-this-in-production-minimum-32-chars-long"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 30

    # Role Security
    ALLOW_ADMIN_SELF_SIGNUP: bool = False

    # Monitoring Telemetry Freshness Thresholds
    MONITORING_TELEMETRY_ONLINE_SECONDS: int = 300   # 5 minutes
    MONITORING_TELEMETRY_STALE_SECONDS: int = 1800   # 30 minutes

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                pass
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
