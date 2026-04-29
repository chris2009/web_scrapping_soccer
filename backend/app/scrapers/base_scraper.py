from abc import ABC, abstractmethod
from typing import Any


class BaseScraper(ABC):
    source_name: str
    source_url: str

    @abstractmethod
    def fetch_matches(self) -> list[dict[str, Any]]:
        """Return matches using the normalized match dictionary format."""

