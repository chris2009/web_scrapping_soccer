from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Match, Team

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/top-teams")
def top_teams_by_goals(
    limit: int = Query(default=10, ge=1, le=30),
    db: Session = Depends(get_db),
):
    """Top teams by total goals scored across all completed matches in the DB."""
    home_goals = (
        select(
            Match.home_team_id.label("team_id"),
            func.sum(Match.home_score).label("goals"),
            func.sum(case((Match.home_score > Match.away_score, 1), else_=0)).label("wins"),
            func.count().label("played"),
        )
        .where(Match.status == "completed", Match.home_score.isnot(None))
        .group_by(Match.home_team_id)
        .subquery()
    )

    away_goals = (
        select(
            Match.away_team_id.label("team_id"),
            func.sum(Match.away_score).label("goals"),
            func.sum(case((Match.away_score > Match.home_score, 1), else_=0)).label("wins"),
            func.count().label("played"),
        )
        .where(Match.status == "completed", Match.away_score.isnot(None))
        .group_by(Match.away_team_id)
        .subquery()
    )

    rows = db.execute(
        select(
            Team.id,
            Team.name,
            Team.crest_url,
            (func.coalesce(home_goals.c.goals, 0) + func.coalesce(away_goals.c.goals, 0)).label("total_goals"),
            (func.coalesce(home_goals.c.wins, 0) + func.coalesce(away_goals.c.wins, 0)).label("total_wins"),
            (func.coalesce(home_goals.c.played, 0) + func.coalesce(away_goals.c.played, 0)).label("total_played"),
        )
        .join(home_goals, home_goals.c.team_id == Team.id, isouter=True)
        .join(away_goals, away_goals.c.team_id == Team.id, isouter=True)
        .where(
            (func.coalesce(home_goals.c.played, 0) + func.coalesce(away_goals.c.played, 0)) > 0
        )
        .order_by(
            (func.coalesce(home_goals.c.goals, 0) + func.coalesce(away_goals.c.goals, 0)).desc()
        )
        .limit(limit)
    ).all()

    return [
        {
            "id": r.id,
            "name": r.name,
            "crest_url": r.crest_url,
            "total_goals": int(r.total_goals or 0),
            "total_wins": int(r.total_wins or 0),
            "total_played": int(r.total_played or 0),
        }
        for r in rows
    ]


@router.get("/goals-timeline")
def goals_timeline(
    team_id: int = Query(..., description="Team ID"),
    db: Session = Depends(get_db),
):
    """Goals scored per match for a given team (last 20 completed matches)."""
    home = db.execute(
        select(
            Match.match_date,
            Match.home_score.label("scored"),
            Match.away_score.label("conceded"),
        )
        .where(Match.home_team_id == team_id, Match.status == "completed", Match.home_score.isnot(None))
        .order_by(Match.match_date.desc())
        .limit(20)
    ).all()

    away = db.execute(
        select(
            Match.match_date,
            Match.away_score.label("scored"),
            Match.home_score.label("conceded"),
        )
        .where(Match.away_team_id == team_id, Match.status == "completed", Match.away_score.isnot(None))
        .order_by(Match.match_date.desc())
        .limit(20)
    ).all()

    combined = sorted(
        [{"date": r.match_date.strftime("%d/%m/%y"), "scored": r.scored, "conceded": r.conceded} for r in home]
        + [{"date": r.match_date.strftime("%d/%m/%y"), "scored": r.scored, "conceded": r.conceded} for r in away],
        key=lambda x: x["date"],
    )
    return combined[-20:]
