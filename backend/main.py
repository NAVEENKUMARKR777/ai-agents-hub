from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from config.settings import Settings
from services.database import Database
from models.user import User
from datetime import datetime
from routes.test_db import router as test_db_router
from models.token import Token
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
import json
from models.agent import Agent, AgentConfig
from pydantic import BaseModel

app = FastAPI(title="AI Agents Hub API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root route
@app.get("/")
async def root():
    return {"message": "Welcome to AI Agents Hub API"}

# Include routers with prefix
app.include_router(test_db_router, prefix="/api")

@app.on_event("startup")
async def startup_db_client():
    await Database.connect_to_database(Settings.MONGODB_URI)
    print("Connected to MongoDB!")

@app.on_event("shutdown")
async def shutdown_db_client():
    await Database.close_database_connection()

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

@app.post("/api/users")
async def create_user(wallet_address: str):
    existing_user = await Database.get_user(wallet_address)
    if existing_user:
        await Database.update_user_login(wallet_address)
        return existing_user
    
    new_user = User(
        wallet_address=wallet_address,
        created_at=datetime.now(),
        last_login=datetime.now()
    )
    user = await Database.create_user(new_user)
    return user

@app.get("/api/users/{wallet_address}")
async def get_user(wallet_address: str):
    user = await Database.get_user(wallet_address)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/tokens")
async def create_token(request: Request):
    try:
        # Get raw data from request
        token_data = await request.json()
        
        # Create Token instance
        token = Token.parse_token(token_data)
        
        # Save to database
        saved_token = await Database.save_token(token)
        
        # Return response
        return JSONResponse(
            status_code=200,
            content=jsonable_encoder(saved_token)
        )
    except Exception as e:
        print(f"Error creating token: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error creating token: {str(e)}"
        )

@app.get("/api/tokens/{wallet_address}")
async def get_user_tokens(wallet_address: str):
    try:
        tokens = await Database.get_user_tokens(wallet_address)
        return JSONResponse(content=jsonable_encoder(tokens))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/tokens/{mint_address}")
async def delete_token(mint_address: str):
    try:
        await Database.delete_token(mint_address)
        return JSONResponse(content={"status": "success"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agents")
async def create_agent(request: Request):
    try:
        agent_data = await request.json()
        agent = Agent.parse_agent(agent_data)
        saved_agent = await Database.save_agent(agent)
        return JSONResponse(
            status_code=200,
            content=jsonable_encoder(saved_agent)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating agent: {str(e)}"
        )

@app.get("/api/agents/{wallet_address}")
async def get_user_agents(wallet_address: str):
    try:
        agents = await Database.get_user_agents(wallet_address)
        return JSONResponse(content=jsonable_encoder(agents))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class StatusUpdate(BaseModel):
    status: str

@app.put("/api/agents/{agent_id}/status")
async def update_agent_status(agent_id: str, status_update: StatusUpdate):
    try:
        await Database.update_agent_status(
            agent_id, 
            status_update.status, 
            datetime.now()
        )
        return JSONResponse(content={"status": "success", "message": "Agent status updated"})
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error updating agent status: {str(e)}"
        )

@app.delete("/api/agents/{agent_id}")
async def delete_agent(agent_id: str):
    try:
        await Database.delete_agent(agent_id)
        return JSONResponse(content={"status": "success"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/agents/{agent_id}/metrics")
async def update_agent_metrics(agent_id: str, metrics: dict):
    try:
        await Database.update_agent_metrics(agent_id, metrics)
        return JSONResponse(content={"status": "success"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 