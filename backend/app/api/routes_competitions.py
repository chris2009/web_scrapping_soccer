from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.competition_schema import CompetitionRead
from app.services.competition_service import list_competitions


router = APIRouter(prefix="/competitions", tags=["competitions"])


@router.get("", response_model=list[CompetitionRead])
def get_competitions(db: Session = Depends(get_db)):
    return list_competitions(db)

