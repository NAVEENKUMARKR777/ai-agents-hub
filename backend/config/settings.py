import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/ai_agents_hub")
    SOLANA_NETWORK = os.getenv("SOLANA_NETWORK", "devnet")
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000") 