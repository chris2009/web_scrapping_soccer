from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Team


def list_teams(db: Session) -> list[dict]:
    teams = db.scalars(
        select(Team)
        .options(joinedload(Team.country))
        .order_by(Team.name)
    ).all()
    return [
        {
            "id": team.id,
            "name": team.name,
            "slug": team.slug,
            "country_name": team.country.name if team.country else None,
        }
        for team in teams
    ]

