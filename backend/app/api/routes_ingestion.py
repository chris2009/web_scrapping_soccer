from fastapi import APIRouter, Depends, HTTPException
from fastapi import Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.ingestion_schema import IngestionResult
from app.services.ingestion_service import IngestionService


router = APIRouter(prefix="/ingestion", tags=["ingestion"])


@router.post("/champions-league/run", response_model=IngestionResult)
def run_champions_league_ingestion(db: Session = Depends(get_db)):
    try:
        return IngestionService(db).run_champions_league_ingestion()
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/champions-league/reset-and-run", response_model=IngestionResult)
def reset_and_run_champions_league_ingestion(db: Session = Depends(get_db)):
    try:
        return IngestionService(db).reset_and_run_champions_league_ingestion()
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/champions-league/history/run", response_model=IngestionResult)
def run_champions_league_history_ingestion(
    start_season: int = Query(default=2020, ge=2020, le=2026),
    end_season: int = Query(default=2025, ge=2020, le=2026),
    db: Session = Depends(get_db),
):
    try:
        return IngestionService(db).run_champions_league_history_ingestion(
            start_season=start_season,
            end_season=end_season,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
