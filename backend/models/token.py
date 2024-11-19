from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class Token(BaseModel):
    wallet_address: str
    mint: str
    tokenAccount: str
    name: str
    symbol: str
    amount: float
    decimals: int
    network: str
    createdAt: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
        
    @classmethod
    def parse_token(cls, data: dict):
        # Convert string date to datetime if needed
        if isinstance(data.get('createdAt'), str):
            data['createdAt'] = datetime.fromisoformat(data['createdAt'].replace('Z', '+00:00'))
        return cls(**data)