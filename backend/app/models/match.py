from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Match(Base):
    __tablename__ = "matches"
    __table_args__ = (
        UniqueConstraint(
            "competition_id",
            "season_id",
            "home_team_id",
            "away_team_id",
            "match_date",
            name="uq_matches_competition_season_teams_date",
        ),
        UniqueConstraint(
            "data_source_id",
            "external_match_id",
            name="uq_matches_source_external_id",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    competition_id: Mapped[int] = mapped_column(ForeignKey("competitions.id"), nullable=False)
    season_id: Mapped[int] = mapped_column(ForeignKey("seasons.id"), nullable=False)
    home_team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), nullable=False)
    away_team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), nullable=False)
    venue_id: Mapped[int | None] = mapped_column(ForeignKey("venues.id"))
    country_id: Mapped[int | None] = mapped_column(ForeignKey("countries.id"))
    data_source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))
    match_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    round: Mapped[str | None] = mapped_column(String(80))
    stage: Mapped[str | None] = mapped_column(String(120))
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="scheduled")
    home_score: Mapped[int | None] = mapped_column(Integer)
    away_score: Mapped[int | None] = mapped_column(Integer)
    source_url: Mapped[str | None] = mapped_column(String(500))
    external_match_id: Mapped[str | None] = mapped_column(String(160))
    last_updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    competition = relationship("Competition", back_populates="matches")
    season = relationship("Season", back_populates="matches")
    home_team = relationship("Team", foreign_keys=[home_team_id], back_populates="home_matches")
    away_team = relationship("Team", foreign_keys=[away_team_id], back_populates="away_matches")
    venue = relationship("Venue", back_populates="matches")
    country = relationship("Country")
    data_source = relationship("DataSource", back_populates="matches")
    events = relationship("MatchEvent", back_populates="match")

