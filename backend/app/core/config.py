import os
from pathlib import Path
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(dotenv_path=BASE_DIR / ".env")


class Settings:

    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "fallback-secret"
    )

    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        os.getenv(
            "ACCESS_TOKEN_EXPIRE_MINUTES",
            60
        )
    )

    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "sqlite:///./app.db"
    )

    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


settings = Settings()
