from fastapi import APIRouter
from services.database import Database

router = APIRouter()

@router.get("/test-db")
async def test_database():
    try:
        # Test MongoDB connection
        await Database.get_database().command('ping')
        return {"status": "Database connection successful"}
    except Exception as e:
        return {"status": "Database connection failed", "error": str(e)} 