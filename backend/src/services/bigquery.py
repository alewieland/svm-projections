from google.cloud import bigquery
from typing import Dict, Any

from ..config import get_settings

_settings = get_settings()


class BigQueryService:
    def __init__(self, dataset: str, table: str):
        self.client = bigquery.Client(project=_settings.PROJECT_ID)
        dataset_ref = self.client.dataset(dataset)
        self.table_ref = dataset_ref.table(table)

    def insert(self, data: Dict[str, Any]):
        errors = self.client.insert_rows_json(self.table_ref, [data])
        if errors:
            raise RuntimeError(f"BigQuery insert errors: {errors}")
