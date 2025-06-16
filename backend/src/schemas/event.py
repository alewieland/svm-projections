from pydantic import BaseModel
from datetime import datetime
from typing import List


class Event(BaseModel):
    id: str | None = None
    name: str
    venue: str
    date: datetime
    clubs: List[str]
    status: str | None = None
