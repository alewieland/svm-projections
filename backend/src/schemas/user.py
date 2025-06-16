from pydantic import BaseModel
from datetime import datetime


class User(BaseModel):
    id: str | None = None
    email: str
    coins: int = 0
    created_at: datetime | None = None
