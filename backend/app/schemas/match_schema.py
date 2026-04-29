from datetime import datetime

from pydantic import BaseModel


class MatchRead(BaseModel):
    id: int
    competition_id: int
    competition_name: str
    season_id: int
    season_name: str
    home_team_id: int
    home_team_name: str
    away_team_id: int
    away_team_name: str
    match_date: datetime
    round: str | None = None
    stage: str | None = None
    status: str
    home_score: int | None = None
    away_score: int | None = None
    venue_name: str | None = None
    country_name: str | None = None
    source_name: str | None = None
    source_url: str | None = None
    external_match_id: str | None = None
    last_updated_at: datetime

