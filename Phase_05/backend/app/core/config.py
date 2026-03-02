"""
File: core/config.py
Purpose: Manages application settings and environment variables (DB, AWS, Secrets).
Usage: Import `settings` to access config values.
Architecture: Core Layer - Configuration Management.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Osomba Marketplace API"
    
    # Database
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: str | int = 5432  # Added to resolve the validation error
    
    @property
    def database_url(self) -> str:
        # Added POSTGRES_PORT to the connection string
        base_url = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        if self.POSTGRES_SERVER != "localhost":
            return f"{base_url}?sslmode=require"
        return base_url

    
    # AWS Configuration
    aws_access_key_id: Optional[str] = Field(default=None, alias="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: Optional[str] = Field(default=None, alias="AWS_SECRET_ACCESS_KEY")
    aws_region: str = Field(default="us-east-1", alias="AWS_REGION")
    s3_bucket_name: Optional[str] = Field(default=None, alias="S3_BUCKET_NAME")
    
    # Cognito Configuration
    cognito_user_pool_id: Optional[str] = Field(default=None, alias="COGNITO_USER_POOL_ID")
    cognito_app_client_id: Optional[str] = Field(default=None, alias="COGNITO_APP_CLIENT_ID")

    # Payment Configuration
    mpesa_api_key: Optional[str] = Field(default=None, alias="MPESA_API_KEY")

    # SendGrid Configuration
    sendgrid_api_key: Optional[str] = Field(default=None, alias="SENDGRID_API_KEY")

    # AI Configuration
    embedding_model: str = Field(default="amazon.titan-embed-text-v2:0", alias="EMBEDDING_MODEL")
    ai_model: str = Field(default="anthropic.claude-3-haiku-20240307-v1:0", alias="AI_MODEL")
    ai_similarity_threshold: float = Field(default=0.5, alias="AI_SIMILARITY_THRESHOLD")

    # Pydantic V2 modern configuration
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",  # Prevents crashes from unknown environment variables
        populate_by_name=True,
        case_sensitive=False
    )


settings = Settings()
