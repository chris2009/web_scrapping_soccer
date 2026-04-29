from fastapi import APIRouter, Depends, HTTPException, Path, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.scrapers.football_data_org_scraper import COMPETITION_CONFIG
from app.schemas.ingestion_schema import IngestionResult
from app.services.ingestion_service import IngestionService


router = APIRouter(prefix="/ingestion", tags=["ingestion"])

VALID_CODES = ", ".join(sorted(COMPETITION_CONFIG.keys()))


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
        return IngestionService(db).run_competition_history_ingestion(
            competition_code="CL",
            start_season=start_season,
            end_season=end_season,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/{competition_code}/history/run", response_model=IngestionResult)
def run_competition_history_ingestion(
    competition_code: str = Path(
        ...,
        description=f"Football-data.org competition code. Valid values: {VALID_CODES}",
    ),
    start_season: int = Query(default=2023, ge=2000, le=2026),
    end_season: int = Query(default=2025, ge=2000, le=2026),
    db: Session = Depends(get_db),
):
    """
    Ingest historical match data from football-data.org for any supported competition.

    Competition codes: CL (Champions League), EL (Europa League),
    PL (Premier League), PD (La Liga), BL1 (Bundesliga), SA (Serie A), FL1 (Ligue 1).
    """
    try:
        return IngestionService(db).run_competition_history_ingestion(
            competition_code=competition_code.upper(),
            start_season=start_season,
            end_season=end_season,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
