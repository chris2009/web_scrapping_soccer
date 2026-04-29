from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.ingestion_schema import IngestionResult
from app.services.ingestion_service import IngestionService


router = APIRouter(prefix="/ingestion", tags=["ingestion"])


@router.post("/champions-league/run", response_model=IngestionResult)
def run_champions_league_ingestion(db: Session = Depends(get_db)):
    try:
        return IngestionService(db).run_champions_league_ingestion()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

