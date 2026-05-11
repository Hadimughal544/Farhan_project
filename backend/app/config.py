from pydantic import AnyHttpUrl, EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Smart AI-Based Admission Advisor API"
    app_version: str = "0.1.0"
    api_v1_prefix: str = "/api/v1"
    debug: bool = True

    database_url: str

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    allowed_origins: list[AnyHttpUrl] = ["http://localhost:5173"]

    first_superuser_email: EmailStr | None = None

    # Optional AI integrations for roadmap/chat enhancements.
    ai_provider: str = "local"
    enable_external_ai: bool = False
    openai_api_key: str | None = None
    gemini_api_key: str | None = None
    # Cloudinary credentials for avatar uploads
    cloudinary_cloud_name: str | None = None
    cloudinary_api_key: str | None = None
    cloudinary_api_secret: str | None = None

    # Email settings for admin bulk email
    # Uses no-reply address - no SMTP configuration required
    smtp_from_email: str = "noreply admin@futurecampus"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
