from fastapi import FastAPI
from .routes import users, events, clubs, bets, odds, projections

app = FastAPI(title="SVM Betting API")

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(events.router, prefix="/events", tags=["events"])
app.include_router(clubs.router, prefix="/clubs", tags=["clubs"])
app.include_router(bets.router, prefix="/bets", tags=["bets"])
app.include_router(odds.router, prefix="/odds", tags=["odds"])
app.include_router(projections.router, prefix="/projections", tags=["projections"])


@app.get("/")
async def root():
    return {"message": "SVM Betting API"}
