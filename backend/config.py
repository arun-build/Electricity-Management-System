import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/python")
    DB_NAME = os.getenv("DB_NAME", "electricity_billing_db")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "electricity_billing_jwt_secret_key_2026_dev")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv("JWT_EXPIRATION_HOURS", 24)))
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("FLASK_ENV", "development") == "development"

    
