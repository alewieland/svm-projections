from firebase_admin import auth
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


security = HTTPBearer()


def create_user_with_email(email: str, password: str):
    """Create a Firebase Auth user."""
    try:
        user = auth.create_user(email=email, password=password)
        return user.uid
    except Exception as exc:  # pragma: no cover - simple example
        raise HTTPException(status_code=400, detail="Could not create user") from exc


def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    try:
        decoded = auth.verify_id_token(token.credentials)
        return decoded
    except Exception as exc:  # pragma: no cover - simple example
        raise HTTPException(status_code=401, detail="Invalid authentication") from exc
