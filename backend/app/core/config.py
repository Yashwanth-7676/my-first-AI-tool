from typing import List, Union
from pydantic import AnyHttpUrl, PostgresDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, extra="ignore"
    )

    PROJECT_NAME: str = "Yash AI Platform"
    API_V1_STR: str = "/api/v1"
    ENV: str = "development"

    # Security
    SECRET_KEY: str = "super-secret-default-key-change-in-prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "yash_ai_db"
    USE_SQLITE: bool = True

    @computed_field
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> Union[PostgresDsn, str]:
        if self.USE_SQLITE:
            return "sqlite+aiosqlite:///./yash_ai.db"
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            username=self.POSTGRES_USER,
            password=self.POSTGRES_PASSWORD,
            host=self.POSTGRES_SERVER,
            port=self.POSTGRES_PORT,
            path=self.POSTGRES_DB,
        )


    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # AI Configuration
    OPENAI_API_KEY: str = ""
    DEFAULT_LLM_MODEL: str = "gpt-4o-mini"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSION: int = 1536


settings = Settings()
