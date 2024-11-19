from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict

class AgentConfig(BaseModel):
    name: str
    description: str
    type: str  # 'token_launcher', 'payment_manager', 'yield_optimizer'
    parameters: Dict  # Flexible configuration parameters
    active: bool = True

class Agent(BaseModel):
    wallet_address: str
    name: str
    description: str
    type: str
    parameters: Dict
    status: str = "idle"  # idle, running, paused, error
    last_action: Optional[datetime] = None
    created_at: datetime = datetime.now()
    active: bool = True
    performance_metrics: Dict = {}

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

    @classmethod
    def parse_agent(cls, data: dict):
        if isinstance(data.get('created_at'), str):
            data['created_at'] = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
        if isinstance(data.get('last_action'), str):
            data['last_action'] = datetime.fromisoformat(data['last_action'].replace('Z', '+00:00'))
        return cls(**data) 