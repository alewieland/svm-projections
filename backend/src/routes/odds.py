from fastapi import APIRouter, HTTPException

from ..services.firestore import FirestoreService
from ..schemas.odds import Odds

router = APIRouter()
service = FirestoreService("odds")


@router.get("/", response_model=list[Odds])
async def list_odds():
    return [Odds(**o) for o in service.list()]


@router.post("/", response_model=str)
async def create_odds(odds: Odds):
    data = odds.model_dump(exclude={"id"})
    return service.create(data)


@router.get("/{odds_id}", response_model=Odds)
async def get_odds(odds_id: str):
    o = service.get(odds_id)
    if not o:
        raise HTTPException(status_code=404, detail="Odds not found")
    return Odds(**o)


@router.put("/{odds_id}")
async def update_odds(odds_id: str, odds: Odds):
    data = odds.model_dump(exclude={"id"})
    service.update(odds_id, data)
    return {"id": odds_id}


@router.delete("/{odds_id}")
async def delete_odds(odds_id: str):
    service.delete(odds_id)
    return {"status": "deleted"}


@router.get("/club/{club_id}", response_model=Odds)
async def odds_for_club(club_id: str):
    doc = service.get(club_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Odds not found")
    return Odds(**doc)
