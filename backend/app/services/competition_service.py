from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Competition


def list_competitions(db: Session) -> list[Competition]:
    return list(db.scalars(select(Competition).order_by(Competition.name)).all())

