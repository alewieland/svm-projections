from typing import Any, Dict, List
from google.cloud.firestore import Client

from ..db import client


class FirestoreService:
    def __init__(self, collection: str, db: Client = client):
        self.collection = db.collection(collection)

    def list(self) -> List[Dict[str, Any]]:
        return [{"id": doc.id, **doc.to_dict()} for doc in self.collection.stream()]

    def get(self, doc_id: str) -> Dict[str, Any] | None:
        doc = self.collection.document(doc_id).get()
        if doc.exists:
            return {"id": doc.id, **doc.to_dict()}
        return None

    def create(self, data: Dict[str, Any]) -> str:
        doc_ref = self.collection.document()
        doc_ref.set(data)
        return doc_ref.id

    def update(self, doc_id: str, data: Dict[str, Any]) -> None:
        self.collection.document(doc_id).update(data)

    def delete(self, doc_id: str) -> None:
        self.collection.document(doc_id).delete()
