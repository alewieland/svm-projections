from pydantic import BaseModel
from typing import Dict


class Odds(BaseModel):
    id: str | None = None
    odds_details: Dict[str, float]
