import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings(BaseModel):
    APP_NAME: str = "Bill Nexa"
    APP_VERSION: str = "1.0.0"
    ENV: str = os.getenv("ENV", "development")
    
    # Storage
    STORAGE_DIR: Path = BASE_DIR / "storage"
    ORIGINAL_DOCS_DIR: Path = BASE_DIR / "storage" / "original-documents"
    TAGGED_DOCS_DIR: Path = BASE_DIR / "storage" / "tagged-documents"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'storage' / 'billnexa.db'}")
    
    # Supabase (Optional for direct connection)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # AI Engine
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "demo") # demo | gemini | openai
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL_NAME: str = os.getenv("AI_MODEL_NAME", "gemini-1.5-pro")

    # JWT Auth
    JWT_SECRET: str = os.getenv("JWT_SECRET", "bill-nexa-enterprise-secret-key-2026")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

settings = Settings()

# Ensure directories exist
settings.ORIGINAL_DOCS_DIR.mkdir(parents=True, exist_ok=True)
settings.TAGGED_DOCS_DIR.mkdir(parents=True, exist_ok=True)

