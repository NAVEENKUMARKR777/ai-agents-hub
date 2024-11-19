from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class User(BaseModel):
    wallet_address: str
    created_at: datetime = datetime.now()
    last_login: Optional[datetime] = None
    network: str = "devnet" 