from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.team_schema import TeamRead
from app.services.team_service import list_teams


router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("", response_model=list[TeamRead])
def get_teams(db: Session = Depends(get_db)):
    return list_teams(db)

