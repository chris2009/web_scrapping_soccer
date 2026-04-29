from __future__ import annotations

import time
from typing import Any

from app.scrapers.base_scraper import BaseScraper
from app.utils.logger import get_logger


logger = get_logger(__name__)


class ChampionsLeagueMockScraper(BaseScraper):
    source_name = "mock_champions_league_source"
    source_url = "https://example.com/mock/champions-league"

    def __init__(self, delay_seconds: float = 0.2) -> None:
        self.delay_seconds = delay_seconds

    def fetch_matches(self) -> list[dict[str, Any]]:
        logger.info("Starting Champions League mock data collection")
        matches = [
            {
                "competition": "Champions League",
                "season": "2025/2026",
                "home_team": "Real Madrid",
                "away_team": "Manchester City",
                "match_date": "2026-05-06T19:00:00+00:00",
                "round": "Semi-final",
                "stage": "Knockout",
                "status": "scheduled",
                "home_score": None,
                "away_score": None,
                "venue": "Santiago Bernabeu",
                "country": "Spain",
                "source_name": self.source_name,
                "source_url": self.source_url,
                "external_match_id": "ucl-2025-2026-sf-rma-mci",
            },
            {
                "competition": "Champions League",
                "season": "2025/2026",
                "home_team": "Paris Saint-Germain",
                "away_team": "Bayern Munich",
                "match_date": "2026-05-07T19:00:00+00:00",
                "round": "Semi-final",
                "stage": "Knockout",
                "status": "scheduled",
                "home_score": None,
                "away_score": None,
                "venue": "Parc des Princes",
                "country": "France",
                "source_name": self.source_name,
                "source_url": self.source_url,
                "external_match_id": "ucl-2025-2026-sf-psg-bay",
            },
            {
                "competition": "Champions League",
                "season": "2025/2026",
                "home_team": "Barcelona",
                "away_team": "Inter Milan",
                "match_date": "2026-04-22T19:00:00+00:00",
                "round": "Quarter-final",
                "stage": "Knockout",
                "status": "completed",
                "home_score": 2,
                "away_score": 1,
                "venue": "Estadi Olimpic Lluis Companys",
                "country": "Spain",
                "source_name": self.source_name,
                "source_url": self.source_url,
                "external_match_id": "ucl-2025-2026-qf-bar-int",
            },
            {
                "competition": "Champions League",
                "season": "2025/2026",
                "home_team": "Arsenal",
                "away_team": "Borussia Dortmund",
                "match_date": "2026-04-23T19:00:00+00:00",
                "round": "Quarter-final",
                "stage": "Knockout",
                "status": "completed",
                "home_score": 1,
                "away_score": 1,
                "venue": "Emirates Stadium",
                "country": "England",
                "source_name": self.source_name,
                "source_url": self.source_url,
                "external_match_id": "ucl-2025-2026-qf-ars-bvb",
            },
        ]

        for _ in matches:
            time.sleep(self.delay_seconds)

        logger.info("Collected %s Champions League mock matches", len(matches))
        return matches

