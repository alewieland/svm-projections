from pydantic import BaseModel
from datetime import datetime


class User(BaseModel):
    id: str | None = None
    email: str
    coins: int = 0
    role: str = "user"
    created_at: datetime | None = None
