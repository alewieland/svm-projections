from google.cloud import bigquery
from typing import Dict, Any

from ..config import get_settings

_settings = get_settings()


class BigQueryService:
    def __init__(self, dataset: str, table: str | None = None):
        self.client = bigquery.Client(project=_settings.PROJECT_ID)
        dataset_ref = self.client.dataset(dataset)
        self.table_ref = dataset_ref.table(table) if table else None

    def insert(self, data: Dict[str, Any]):
        if not self.table_ref:
            raise RuntimeError("insert called without table")
        errors = self.client.insert_rows_json(self.table_ref, [data])
        if errors:
            raise RuntimeError(f"BigQuery insert errors: {errors}")

    def query(self, sql: str, params: Dict[str, Any] | None = None) -> list[Dict[str, Any]]:
        job_config = bigquery.QueryJobConfig()
        if params:
            job_config.query_parameters = [
                bigquery.ScalarQueryParameter(k, "STRING", v) for k, v in params.items()
            ]
        job = self.client.query(sql, job_config=job_config)
        return [dict(row) for row in job.result()]
