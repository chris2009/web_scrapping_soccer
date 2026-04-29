from __future__ import annotations

import time
from typing import Any

import requests

from app.config import get_settings
from app.scrapers.base_scraper import BaseScraper
from app.utils.logger import get_logger


logger = get_logger(__name__)


class FootballDataOrgChampionsLeagueScraper(BaseScraper):
    source_name = "football-data.org"
    source_url = "https://api.football-data.org/v4/competitions/CL/matches"

    def __init__(self, delay_seconds: float = 1.2) -> None:
        self.delay_seconds = delay_seconds
        self.settings = get_settings()
        self.skipped_seasons: list[str] = []

    def fetch_matches_for_seasons(self, start_season: int = 2020, end_season: int = 2025) -> list[dict[str, Any]]:
        if not self.settings.football_data_api_token:
            raise RuntimeError("FOOTBALL_DATA_API_TOKEN is not configured")

        all_matches: list[dict[str, Any]] = []
        for season_start in range(start_season, end_season + 1):
            logger.info("Fetching Champions League season %s from football-data.org", season_start)
            response = requests.get(
                self.source_url,
                params={"season": season_start},
                headers={"X-Auth-Token": self.settings.football_data_api_token},
                timeout=30,
            )
            if response.status_code == 403:
                message = self._restricted_message(response, season_start)
                logger.warning(message)
                self.skipped_seasons.append(message)
                time.sleep(self.delay_seconds)
                continue
            response.raise_for_status()
            payload = response.json()
            all_matches.extend(self._normalize_match(match, season_start) for match in payload.get("matches", []))
            time.sleep(self.delay_seconds)

        logger.info("Collected %s Champions League matches from football-data.org", len(all_matches))
        return all_matches

    def fetch_matches(self) -> list[dict[str, Any]]:
        return self.fetch_matches_for_seasons()

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
            "competition": "Champions League",
            "season": f"{season_start}/{season_start + 1}",
            "home_team": home_team.get("name") or "Unknown home team",
            "away_team": away_team.get("name") or "Unknown away team",
            "match_date": match.get("utcDate"),
            "round": self._format_round(match),
            "stage": self._format_stage(match.get("stage")),
            "status": self._map_status(match.get("status")),
            "home_score": full_time.get("home"),
            "away_score": full_time.get("away"),
            "venue": match.get("venue") or "Unknown venue",
            "country": "Europe",
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
