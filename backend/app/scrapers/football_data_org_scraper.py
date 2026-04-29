from __future__ import annotations

import time
from typing import Any

import requests

from app.config import get_settings
from app.scrapers.base_scraper import BaseScraper
from app.utils.logger import get_logger


logger = get_logger(__name__)

COMPETITION_CONFIG: dict[str, dict[str, str]] = {
    "CL":  {"name": "Champions League", "slug": "champions-league", "region": "Europe"},
    "EL":  {"name": "Europa League",    "slug": "europa-league",    "region": "Europe"},
    "PL":  {"name": "Premier League",   "slug": "premier-league",   "region": "England"},
    "PD":  {"name": "La Liga",          "slug": "la-liga",          "region": "Spain"},
    "BL1": {"name": "Bundesliga",       "slug": "bundesliga",       "region": "Germany"},
    "SA":  {"name": "Serie A",          "slug": "serie-a",          "region": "Italy"},
    "FL1": {"name": "Ligue 1",          "slug": "ligue-1",          "region": "France"},
}


class FootballDataOrgScraper(BaseScraper):
    BASE_URL = "https://api.football-data.org/v4/competitions/{code}/matches"
    source_name = "football-data.org"

    def __init__(self, competition_code: str, delay_seconds: float = 1.2) -> None:
        config = COMPETITION_CONFIG.get(competition_code.upper())
        if not config:
            raise ValueError(
                f"Unknown competition code '{competition_code}'. "
                f"Valid codes: {', '.join(COMPETITION_CONFIG)}"
            )
        self.competition_code = competition_code.upper()
        self.competition_config = config
        self.source_url = self.BASE_URL.format(code=self.competition_code)
        self.delay_seconds = delay_seconds
        self.settings = get_settings()
        self.skipped_seasons: list[str] = []

    def fetch_matches_for_seasons(self, start_season: int, end_season: int) -> list[dict[str, Any]]:
        if not self.settings.football_data_api_token:
            raise RuntimeError("FOOTBALL_DATA_API_TOKEN is not configured")

        all_matches: list[dict[str, Any]] = []
        for season_start in range(start_season, end_season + 1):
            logger.info(
                "Fetching %s season %s from football-data.org",
                self.competition_config["name"],
                season_start,
            )
            response = requests.get(
                self.source_url,
                params={"season": season_start},
                headers={"X-Auth-Token": self.settings.football_data_api_token},
                timeout=30,
            )
            if response.status_code == 403:
                msg = self._restricted_message(response, season_start)
                logger.warning(msg)
                self.skipped_seasons.append(msg)
                time.sleep(self.delay_seconds)
                continue
            response.raise_for_status()
            payload = response.json()
            all_matches.extend(
                self._normalize_match(match, season_start) for match in payload.get("matches", [])
            )
            time.sleep(self.delay_seconds)

        logger.info(
            "Collected %s %s matches from football-data.org",
            len(all_matches),
            self.competition_config["name"],
        )
        return all_matches

    def fetch_matches(self) -> list[dict[str, Any]]:
        return self.fetch_matches_for_seasons(2023, 2025)

    def _restricted_message(self, response: requests.Response, season_start: int) -> str:
        try:
            payload = response.json()
            api_message = payload.get("message")
        except ValueError:
            api_message = response.text
        if api_message:
            return f"{season_start}/{season_start + 1}: {api_message}"
        return f"{season_start}/{season_start + 1}: restricted resource"

    def _normalize_match(self, match: dict[str, Any], season_start: int) -> dict[str, Any]:
        score = match.get("score") or {}
        full_time = score.get("fullTime") or {}
        home_team = match.get("homeTeam") or {}
        away_team = match.get("awayTeam") or {}

        return {
            "competition": self.competition_config["name"],
            "competition_slug": self.competition_config["slug"],
            "competition_region": self.competition_config["region"],
            "season": f"{season_start}/{season_start + 1}",
            "home_team": home_team.get("name") or "Unknown home team",
            "home_team_crest": home_team.get("crest"),
            "away_team": away_team.get("name") or "Unknown away team",
            "away_team_crest": away_team.get("crest"),
            "match_date": match.get("utcDate"),
            "round": self._format_round(match),
            "stage": self._format_stage(match.get("stage")),
            "status": self._map_status(match.get("status")),
            "home_score": full_time.get("home"),
            "away_score": full_time.get("away"),
            "venue": match.get("venue") or "Unknown venue",
            "country": self.competition_config["region"],
            "source_name": self.source_name,
            "source_url": self.source_url,
            "external_match_id": f"football-data-org-{match.get('id')}",
        }

    def _map_status(self, status: str | None) -> str:
        mapping = {
            "FINISHED": "completed",
            "SCHEDULED": "scheduled",
            "TIMED": "scheduled",
            "IN_PLAY": "live",
            "PAUSED": "live",
            "POSTPONED": "postponed",
            "SUSPENDED": "suspended",
            "CANCELLED": "cancelled",
        }
        return mapping.get(status or "", "scheduled")

    def _format_stage(self, stage: str | None) -> str:
        if not stage:
            return "Unknown"
        return stage.replace("_", " ").title()

    def _format_round(self, match: dict[str, Any]) -> str:
        matchday = match.get("matchday")
        group = match.get("group")
        if group:
            return str(group)
        if matchday:
            return f"Matchday {matchday}"
        return self._format_stage(match.get("stage"))


# Keep backward-compatible alias
class FootballDataOrgChampionsLeagueScraper(FootballDataOrgScraper):
    def __init__(self, delay_seconds: float = 1.2) -> None:
        super().__init__("CL", delay_seconds)

    def fetch_matches_for_seasons(self, start_season: int = 2020, end_season: int = 2025) -> list[dict[str, Any]]:
        return super().fetch_matches_for_seasons(start_season, end_season)
