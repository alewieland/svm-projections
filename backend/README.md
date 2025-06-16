# Backend

Simple FastAPI backend using Firestore.

## Setup

Create a `.env` file based on `.env.sample` and provide `FIREBASE_PROJECT_ID` and `GOOGLE_APPLICATION_CREDENTIALS` pointing to your service account JSON file.

Install dependencies and run locally:

```bash
pip install -r requirements.txt  # or use `uv pip install -r pyproject.toml`
uvicorn src.main:app --reload
```

## Authentication

Firebase Authentication is used to secure API endpoints. Provide a service
account JSON file in `GOOGLE_APPLICATION_CREDENTIALS` and set
`FIREBASE_PROJECT_ID` in your environment. Clients should authenticate with
Firebase and send the ID token in the `Authorization` header when calling the
API.

The API exposes CRUD operations for users, events, clubs, bets and odds. Bets
can be matched by posting to `/bets/{bet_id}/match` with the opponent user id.

