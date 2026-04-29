from datetime import date, datetime, time, timezone

from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload

from app.models import Match


def _base_query():
    return (
        select(Match)
        .options(
            joinedload(Match.competition),
            joinedload(Match.season),
            joinedload(Match.home_team),
            joinedload(Match.away_team),
            joinedload(Match.venue),
            joinedload(Match.country),
            joinedload(Match.data_source),
        )
        .order_by(Match.match_date.desc())
    )


def serialize_match(match: Match) -> dict:
    return {
        "id": match.id,
        "competition_id": match.competition_id,
        "competition_name": match.competition.name,
        "season_id": match.season_id,
        "season_name": match.season.name,
        "home_team_id": match.home_team_id,
        "home_team_name": match.home_team.name,
        "away_team_id": match.away_team_id,
        "away_team_name": match.away_team.name,
        "match_date": match.match_date,
        "round": match.round,
        "stage": match.stage,
        "status": match.status,
        "home_score": match.home_score,
        "away_score": match.away_score,
        "venue_name": match.venue.name if match.venue else None,
        "country_name": match.country.name if match.country else None,
        "source_name": match.data_source.name if match.data_source else None,
        "source_url": match.source_url,
        "external_match_id": match.external_match_id,
        "last_updated_at": match.last_updated_at,
    }


def list_matches(db: Session, status: str | None = None, limit: int = 100) -> list[dict]:
    query = _base_query()
    if status:
        query = query.where(Match.status == status)
    matches = db.scalars(query.limit(limit)).all()
    return [serialize_match(match) for match in matches]


def list_upcoming_matches(db: Session, limit: int = 50) -> list[dict]:
    now = datetime.now(timezone.utc)
    query = (
        _base_query()
        .where(Match.match_date >= now)
        .order_by(None)
        .order_by(Match.match_date.asc())
        .limit(limit)
    )
    return [serialize_match(match) for match in db.scalars(query).all()]


def list_recent_results(db: Session, limit: int = 50) -> list[dict]:
    query = (
        _base_query()
        .where(Match.status == "completed")
        .order_by(None)
        .order_by(Match.match_date.desc())
        .limit(limit)
    )
    return [serialize_match(match) for match in db.scalars(query).all()]


def list_matches_by_date(db: Session, match_day: date) -> list[dict]:
    start = datetime.combine(match_day, time.min).replace(tzinfo=timezone.utc)
    end = datetime.combine(match_day, time.max).replace(tzinfo=timezone.utc)
    query = _base_query().where(Match.match_date >= start, Match.match_date <= end)
    return [serialize_match(match) for match in db.scalars(query).all()]


def list_matches_by_competition(db: Session, competition_id: int) -> list[dict]:
    query = _base_query().where(Match.competition_id == competition_id)
    return [serialize_match(match) for match in db.scalars(query).all()]


def list_matches_by_team(db: Session, team_id: int) -> list[dict]:
    query = _base_query().where(
        or_(Match.home_team_id == team_id, Match.away_team_id == team_id)
    )
    return [serialize_match(match) for match in db.scalars(query).all()]
