from pydantic import BaseModel

class Club(BaseModel):
    id: str | None = None
    name: str
    league: str | None = None
    points: int | None = None
