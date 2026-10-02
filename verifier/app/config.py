import os
from dataclasses import dataclass
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    gemini_api_key: str
    gemini_model: str
    service_token: str
    max_upload_bytes: int


@lru_cache
def get_settings() -> Settings:
    return Settings(
        gemini_api_key=os.environ.get("GEMINI_API_KEY", ""),
        gemini_model=os.environ.get("GEMINI_MODEL", "gemini-2.5-flash"),
        service_token=os.environ.get("SERVICE_TOKEN", ""),
        max_upload_bytes=int(os.environ.get("MAX_UPLOAD_BYTES", 5 * 1024 * 1024)),
    )
