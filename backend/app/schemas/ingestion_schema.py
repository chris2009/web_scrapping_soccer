from pydantic import BaseModel


class IngestionResult(BaseModel):
    competition: str
    source_name: str
    records_found: int
    records_inserted: int
    records_updated: int
    status: str
    message: str
    skipped_seasons: list[str] = []
