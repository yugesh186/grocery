import os

class Settings:
    PROJECT_NAME: str = "FreshKart AI API"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretfreshkartkey1234567890!")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 1 day
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./freshkart.db")

settings = Settings()
