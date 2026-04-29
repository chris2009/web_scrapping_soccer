from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Competition, Country, DataSource, IngestionLog, Match, Season, Team, Venue
from app.scrapers.champions_league_scraper import ChampionsLeagueMockScraper
from app.utils.logger import get_logger


logger = get_logger(__name__)


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


class IngestionService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def run_champions_league_ingestion(self) -> dict[str, Any]:
        scraper = ChampionsLeagueMockScraper()
        records = scraper.fetch_matches()
        inserted = 0
        updated = 0
        competition: Competition | None = None
        data_source: DataSource | None = None

        try:
            for record in records:
                competition = self._get_or_create_competition(record["competition"], "champions-league", "Europe")
                season = self._get_or_create_season(competition, record["season"])
                country = self._get_or_create_country(record["country"])
                home_team = self._get_or_create_team(record["home_team"])
                away_team = self._get_or_create_team(record["away_team"])
                venue = self._get_or_create_venue(record["venue"], country)
                data_source = self._get_or_create_data_source(
                    record["source_name"],
                    record["source_url"],
                )

                match, was_inserted = self._upsert_match(
                    record=record,
                    competition=competition,
                    season=season,
                    home_team=home_team,
                    away_team=away_team,
                    venue=venue,
                    country=country,
                    data_source=data_source,
                )
                logger.info("Upserted match %s", match.external_match_id)
                if was_inserted:
                    inserted += 1
                else:
                    updated += 1

            self._write_ingestion_log(
                competition=competition,
                data_source=data_source,
                status="success",
                records_found=len(records),
                records_inserted=inserted,
                records_updated=updated,
            )
            self.db.commit()
            return {
                "competition": "Champions League",
                "source_name": scraper.source_name,
                "records_found": len(records),
                "records_inserted": inserted,
                "records_updated": updated,
                "status": "success",
                "message": "Champions League mock ingestion completed",
            }
        except Exception as exc:
            logger.exception("Champions League ingestion failed")
            self.db.rollback()
            self._write_ingestion_log(
                competition=None,
                data_source=None,
                status="failed",
                records_found=len(records),
                records_inserted=inserted,
                records_updated=updated,
                error_message=str(exc),
            )
            self.db.commit()
            raise

    def _get_or_create_country(self, name: str) -> Country:
        country = self.db.scalar(select(Country).where(Country.name == name))
        if country:
            return country

        country = Country(name=name)
        self.db.add(country)
        self.db.flush()
        return country

    def _get_or_create_competition(self, name: str, slug: str, region: str) -> Competition:
        competition = self.db.scalar(select(Competition).where(Competition.slug == slug))
        if competition:
            return competition

        competition = Competition(name=name, slug=slug, region=region)
        self.db.add(competition)
        self.db.flush()
        return competition

    def _get_or_create_season(self, competition: Competition, name: str) -> Season:
        season = self.db.scalar(
            select(Season).where(
                Season.competition_id == competition.id,
                Season.name == name,
            )
        )
        if season:
            return season

        year_start, year_end = self._parse_season_years(name)
        season = Season(
            competition_id=competition.id,
            name=name,
            year_start=year_start,
            year_end=year_end,
        )
        self.db.add(season)
        self.db.flush()
        return season

    def _get_or_create_team(self, name: str) -> Team:
        slug = slugify(name)
        team = self.db.scalar(select(Team).where(Team.slug == slug))
        if team:
            return team

        team = Team(name=name, slug=slug)
        self.db.add(team)
        self.db.flush()
        return team

    def _get_or_create_venue(self, name: str, country: Country) -> Venue:
        venue = self.db.scalar(
            select(Venue).where(Venue.name == name, Venue.country_id == country.id)
        )
        if venue:
            return venue

        venue = Venue(name=name, country_id=country.id)
        self.db.add(venue)
        self.db.flush()
        return venue

    def _get_or_create_data_source(self, name: str, base_url: str) -> DataSource:
        data_source = self.db.scalar(select(DataSource).where(DataSource.name == name))
        if data_source:
            return data_source

        data_source = DataSource(name=name, base_url=base_url, is_official=False, is_active=True)
        self.db.add(data_source)
        self.db.flush()
        return data_source

    def _upsert_match(
        self,
        record: dict[str, Any],
        competition: Competition,
        season: Season,
        home_team: Team,
        away_team: Team,
        venue: Venue,
        country: Country,
        data_source: DataSource,
    ) -> tuple[Match, bool]:
        match_date = datetime.fromisoformat(record["match_date"])
        if match_date.tzinfo is None:
            match_date = match_date.replace(tzinfo=timezone.utc)

        match = self.db.scalar(
            select(Match).where(
                Match.data_source_id == data_source.id,
                Match.external_match_id == record["external_match_id"],
            )
        )

        if match is None:
            match = self.db.scalar(
                select(Match).where(
                    Match.competition_id == competition.id,
                    Match.season_id == season.id,
                    Match.home_team_id == home_team.id,
                    Match.away_team_id == away_team.id,
                    Match.match_date == match_date,
                )
            )

        was_inserted = match is None
        if match is None:
            match = Match(
                competition_id=competition.id,
                season_id=season.id,
                home_team_id=home_team.id,
                away_team_id=away_team.id,
                match_date=match_date,
            )
            self.db.add(match)

        match.venue_id = venue.id
        match.country_id = country.id
        match.data_source_id = data_source.id
        match.round = record.get("round")
        match.stage = record.get("stage")
        match.status = record.get("status", "scheduled")
        match.home_score = record.get("home_score")
        match.away_score = record.get("away_score")
        match.source_url = record.get("source_url")
        match.external_match_id = record.get("external_match_id")
        self.db.flush()
        return match, was_inserted

    def _write_ingestion_log(
        self,
        competition: Competition | None,
        data_source: DataSource | None,
        status: str,
        records_found: int,
        records_inserted: int,
        records_updated: int,
        error_message: str | None = None,
    ) -> None:
        log = IngestionLog(
            competition_id=competition.id if competition else None,
            data_source_id=data_source.id if data_source else None,
            status=status,
            records_found=records_found,
            records_inserted=records_inserted,
            records_updated=records_updated,
            error_message=error_message,
            finished_at=datetime.now(timezone.utc),
        )
        self.db.add(log)
        self.db.flush()

    def _parse_season_years(self, season_name: str) -> tuple[int | None, int | None]:
        parts = season_name.split("/")
        if len(parts) != 2:
            return None, None
        try:
            return int(parts[0]), int(parts[1])
        except ValueError:
            return None, None
