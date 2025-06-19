from fastapi import APIRouter
from ..services.bigquery import BigQueryService

router = APIRouter()
bq = BigQueryService("svm")

@router.get("/{sheet_name}")
async def list_projections(sheet_name: str):
    """Return projection rows for the given sheet name from BigQuery."""
    sql = "SELECT * FROM `svm.projections` WHERE sheet_name = @name ORDER BY row_num"
    rows = bq.query(sql, {"name": sheet_name})
    values = [list(row.values()) for row in rows]
    return {"values": values}
