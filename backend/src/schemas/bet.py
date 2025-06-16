from pydantic import BaseModel
from datetime import datetime


class Bet(BaseModel):
    id: str | None = None
    user_id: str
    event_id: str
    club_picked: str
    amount: float
    odds: float
    opponent_id: str | None = None
    status: str = "pending"
    placed_at: datetime | None = None
