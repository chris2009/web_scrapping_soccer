import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.schemas.competition_schema import CompetitionRead
from app.services.competition_service import list_competitions


router = APIRouter(prefix="/competitions", tags=["competitions"])


@router.get("", response_model=list[CompetitionRead])
def get_competitions(db: Session = Depends(get_db)):
    return list_competitions(db)


@router.get("/{code}/standings")
def get_standings(code: str):
    settings = get_settings()
    if not settings.football_data_api_token:
        raise HTTPException(status_code=400, detail="FOOTBALL_DATA_API_TOKEN not configured")

    url = f"https://api.football-data.org/v4/competitions/{code.upper()}/standings"
    try:
        response = requests.get(
            url,
            headers={"X-Auth-Token": settings.football_data_api_token},
            timeout=15,
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=503, detail=f"API unreachable: {exc}") from exc

    if response.status_code == 403:
        raise HTTPException(status_code=403, detail="Standings not available in your football-data.org plan")
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail=f"Competition '{code}' not found")

    response.raise_for_status()
    return response.json()
