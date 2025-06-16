from fastapi import APIRouter, HTTPException

from ..services.firestore import FirestoreService
from ..schemas.club import Club

router = APIRouter()
service = FirestoreService("clubs")


@router.get("/", response_model=list[Club])
async def list_clubs():
    return [Club(**c) for c in service.list()]


@router.post("/", response_model=str)
async def create_club(club: Club):
    data = club.model_dump(exclude={"id"})
    return service.create(data)


@router.get("/{club_id}", response_model=Club)
async def get_club(club_id: str):
    club = service.get(club_id)
    if not club:
        raise HTTPException(status_code=404, detail="Club not found")
    return Club(**club)


@router.put("/{club_id}")
async def update_club(club_id: str, club: Club):
    data = club.model_dump(exclude={"id"})
    service.update(club_id, data)
    return {"id": club_id}


@router.delete("/{club_id}")
async def delete_club(club_id: str):
    service.delete(club_id)
    return {"status": "deleted"}
