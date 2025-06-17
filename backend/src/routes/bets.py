from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from fastapi import Body

from ..services.firestore import FirestoreService
from ..services.bigquery import BigQueryService
from ..schemas.bet import Bet

router = APIRouter()
service = FirestoreService("bets")
bq = BigQueryService("svm", "bets")


@router.get("/", response_model=list[Bet])
async def list_bets():
    return [Bet(**b) for b in service.list()]


@router.post("/", response_model=str)
async def create_bet(bet: Bet):
    data = bet.model_dump(exclude={"id"})
    if not data.get("placed_at"):
        data["placed_at"] = datetime.now(timezone.utc)
    bet_id = service.create(data)
    try:
        bq.insert({"id": bet_id, **data})
    except Exception:
        pass
    return bet_id


@router.get("/{bet_id}", response_model=Bet)
async def get_bet(bet_id: str):
    bet = service.get(bet_id)
    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")
    return Bet(**bet)


@router.put("/{bet_id}")
async def update_bet(bet_id: str, bet: Bet):
    data = bet.model_dump(exclude={"id"})
    service.update(bet_id, data)
    return {"id": bet_id}


@router.delete("/{bet_id}")
async def delete_bet(bet_id: str):
    service.delete(bet_id)
    return {"status": "deleted"}


@router.post("/{bet_id}/match")
async def match_bet(bet_id: str, opponent_id: str = Body(..., embed=True)):
    """Accept a bet by specifying an opponent user id."""
    bet = service.get(bet_id)
    if not bet:
        raise HTTPException(status_code=404, detail="Bet not found")
    service.update(bet_id, {"opponent_id": opponent_id, "status": "matched"})
    return {"id": bet_id, "status": "matched"}
