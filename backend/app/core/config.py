"""
Application settings loaded from environment variables.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration for the PathAI FastAPI backend."""

    # OpenAI / LLM
    OPENAI_API_KEY: str = ""
    OPENAI_API_BASE_URL: str = "https://api.openai.com/v1"

    # Supabase
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Server
    PORT: int = 8000
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton for app settings."""
    return Settings()
