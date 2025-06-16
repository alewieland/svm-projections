import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    GOOGLE_APPLICATION_CREDENTIALS: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")


@lru_cache
def get_settings() -> Settings:
    return Settings()
