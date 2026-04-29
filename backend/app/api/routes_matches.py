from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.match_schema import MatchRead
from app.services.match_service import (
    list_matches,
    list_matches_by_competition,
    list_matches_by_date,
    list_matches_by_team,
    list_recent_results,
    list_upcoming_matches,
)


router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("", response_model=list[MatchRead])
def get_matches(
    status: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    return list_matches(db, status=status, limit=limit)


@router.get("/upcoming", response_model=list[MatchRead])
def get_upcoming_matches(
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return list_upcoming_matches(db, limit=limit)


@router.get("/recent", response_model=list[MatchRead])
def get_recent_results(
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return list_recent_results(db, limit=limit)


@router.get("/by-date", response_model=list[MatchRead])
def get_matches_by_date(
    match_date: date = Query(..., description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
):
    return list_matches_by_date(db, match_date)


@router.get("/by-competition/{competition_id}", response_model=list[MatchRead])
def get_matches_by_competition(competition_id: int, db: Session = Depends(get_db)):
    return list_matches_by_competition(db, competition_id)


@router.get("/by-team/{team_id}", response_model=list[MatchRead])
def get_matches_by_team(team_id: int, db: Session = Depends(get_db)):
    return list_matches_by_team(db, team_id)

