from fastapi import APIRouter, HTTPException

from ..services.firestore import FirestoreService
from ..schemas.event import Event

router = APIRouter()
service = FirestoreService("events")


@router.get("/", response_model=list[Event])
async def list_events():
    return [Event(**e) for e in service.list()]


@router.post("/", response_model=str)
async def create_event(event: Event):
    data = event.model_dump(exclude={"id"})
    return service.create(data)


@router.get("/{event_id}", response_model=Event)
async def get_event(event_id: str):
    ev = service.get(event_id)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    return Event(**ev)


@router.put("/{event_id}")
async def update_event(event_id: str, event: Event):
    data = event.model_dump(exclude={"id"})
    service.update(event_id, data)
    return {"id": event_id}


@router.delete("/{event_id}")
async def delete_event(event_id: str):
    service.delete(event_id)
    return {"status": "deleted"}
