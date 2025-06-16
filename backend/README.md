backend/
├── Dockerfile
├── requirements.txt
├── .env.sample            # template for all envs
├── .env.dev               # dev environment variables
├── .env.prod              # prod environment variables
└── src/
    ├── main.py
    ├── config.py          # environment-specific config loader
    ├── db.py              # initialize Firestore using config
    ├── services/
    │   ├── firestore.py
    │   └── auth.py
    ├── schemas/
    │   ├── user.py
    │   ├── event.py
    │   ├── bet.py
    │   └── odds.py
    └── routes/
        ├── __init__.py
        ├── users.py
        ├── events.py
        ├── bets.py
        └── odds.py