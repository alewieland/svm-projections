from fastapi import APIRouter, Depends, HTTPException

from ..services.firestore import FirestoreService
from ..services.auth import get_current_user, create_user_with_email
from ..schemas.user import User

router = APIRouter()
service = FirestoreService("users")


@router.get("/", response_model=list[User])
async def list_users():
    return [User(**u) for u in service.list()]


@router.post("/", response_model=str)
async def create_user(user: User, _=Depends(get_current_user)):
    data = user.model_dump(exclude={"id"})
    return service.create(data)


@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = service.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)


@router.put("/{user_id}")
async def update_user(user_id: str, user: User, _=Depends(get_current_user)):
    data = user.model_dump(exclude={"id"})
    service.update(user_id, data)
    return {"id": user_id}


@router.delete("/{user_id}")
async def delete_user(user_id: str, _=Depends(get_current_user)):
    service.delete(user_id)
    return {"status": "deleted"}


@router.post("/signup", response_model=str)
async def signup(email: str, password: str):
    uid = create_user_with_email(email, password)
    return uid
