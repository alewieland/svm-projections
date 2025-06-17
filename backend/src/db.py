import firebase_admin
from google.cloud import firestore
from firebase_admin import credentials, initialize_app
from .config import get_settings

_settings = get_settings()

if _settings.GOOGLE_APPLICATION_CREDENTIALS:
    cred = credentials.Certificate(_settings.GOOGLE_APPLICATION_CREDENTIALS)
    initialize_app(cred)
else:
    initialize_app()

client = firestore.Client(project=_settings.PROJECT_ID)


