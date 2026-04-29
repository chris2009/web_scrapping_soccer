from __future__ import annotations

import time
from typing import Any

from app.scrapers.base_scraper import BaseScraper
from app.utils.logger import get_logger


logger = get_logger(__name__)


class ChampionsLeagueMockScraper(BaseScraper):
    source_name = "uefa_official_champions_league_snapshot"
    source_url = "https://www.uefa.com/uefachampionsleague/news/02a4-2063e22b19d9-14f7369cb6fd-1000--champions-league-semi-final-ties-and-dates-confirmed/"

    def __init__(self, delay_seconds: float = 0.2) -> None:
        self.delay_seconds = delay_seconds

    def fetch_matches(self) -> list[dict[str, Any]]:
        logger.info("Starting Champions League official snapshot collection")
        matches = [
            {
                "competition": "Champions League",
                "season": "2025/2026",
                "home_team": "Paris Saint-Germain",
                "away_team": "Bayern München",
                "match_date": "2026-04-28T19:00:00+00:00",
                "round": "Semi-final",
                "stage": "Knockout",
                "status": "completed",
                "home_score": 5,
                "away_score": 4,
                "venue": "Parc des Princes",
                "country": "France",
                "source_name": self.source_name,
                "source_url": "https://www.uefa.com/uefachampionsleague/news/02a4-207ffc37742f-abe4807faa3d-1000--paris-5-4-bayern-holders-edge-epic-champions-league-semi-/",
                "external_match_id": "ucl-2025-2026-sf-leg1-psg-bayern",
            },
            {
                "competition": "Champions League",
                "season": "2025/2026",
                "home_team": "Atlético de Madrid",
                "away_team": "Arsenal",
                "match_date": "2026-04-29T19:00:00+00:00",
                "round": "Semi-final",
                "stage": "Knockout",
                "status": "scheduled",
                "home_score": None,
                "away_score": None,
                "venue": "Metropolitano Stadium",
                "country": "Spain",
                "source_name": self.source_name,
                "source_url": self.source_url,
                "external_match_id": "ucl-2025-2026-sf-leg1-atleti-arsenal",
            },
            {
                "competition": "Champions League",
                "season": "2025/2026",
                "home_team": "Arsenal",
                "away_team": "Atlético de Madrid",
                "match_date": "2026-05-05T19:00:00+00:00",
                "round": "Semi-final",
                "stage": "Knockout",
                "status": "scheduled",
                "home_score": None,
                "away_score": None,
                "venue": "Emirates Stadium",
                "country": "England",
                "source_name": self.source_name,
                "source_url": self.source_url,
                "external_match_id": "ucl-2025-2026-sf-leg2-arsenal-atleti",
            },
            {
                "competition": "Champions League",
                "season": "2025/2026",
                "home_team": "Bayern München",
                "away_team": "Paris Saint-Germain",
                "match_date": "2026-05-06T19:00:00+00:00",
                "round": "Semi-final",
                "stage": "Knockout",
                "status": "scheduled",
                "home_score": None,
                "away_score": None,
                "venue": "Allianz Arena",
                "country": "Germany",
                "source_name": self.source_name,
                "source_url": self.source_url,
                "external_match_id": "ucl-2025-2026-sf-leg2-bayern-psg",
            },
        ]

        for _ in matches:
            time.sleep(self.delay_seconds)

        logger.info("Collected %s Champions League official snapshot matches", len(matches))
        return matches
