import type { Competition } from "@/types/competition";
import type { Match } from "@/types/match";
import type { Team } from "@/types/team";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export type IngestionResult = {
  competition: string;
  source_name: string;
  records_found: number;
  records_inserted: number;
  records_updated: number;
  status: string;
  message: string;
};

export const api = {
  health: () => request<{ status: string }>("/health"),
  competitions: () => request<Competition[]>("/competitions"),
  teams: () => request<Team[]>("/teams"),
  matches: (status?: string) => request<Match[]>(status ? `/matches?status=${status}` : "/matches"),
  upcomingMatches: () => request<Match[]>("/matches/upcoming"),
  recentResults: () => request<Match[]>("/matches/recent"),
  matchesByDate: (date: string) => request<Match[]>(`/matches/by-date?match_date=${date}`),
  matchesByCompetition: (competitionId: number) =>
    request<Match[]>(`/matches/by-competition/${competitionId}`),
  matchesByTeam: (teamId: number) => request<Match[]>(`/matches/by-team/${teamId}`),
  runChampionsLeagueIngestion: () =>
    request<IngestionResult>("/ingestion/champions-league/run", { method: "POST" }),
};

