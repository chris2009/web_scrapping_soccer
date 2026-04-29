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
  skipped_seasons: string[];
};

export const SUPPORTED_COMPETITIONS = [
  { code: "CL",  name: "Champions League", color: "#1a56db" },
  { code: "EL",  name: "Europa League",    color: "#ea580c" },
  { code: "PL",  name: "Premier League",   color: "#7c3aed" },
  { code: "PD",  name: "La Liga",          color: "#dc2626" },
  { code: "BL1", name: "Bundesliga",       color: "#d97706" },
  { code: "SA",  name: "Serie A",          color: "#0e7490" },
  { code: "FL1", name: "Ligue 1",          color: "#059669" },
] as const;

export const api = {
  health: () => request<{ status: string }>("/health"),
  competitions: () => request<Competition[]>("/competitions"),
  teams: () => request<Team[]>("/teams"),
  matches: (status?: string) =>
    request<Match[]>(status ? `/matches?status=${status}` : "/matches"),
  upcomingMatches: () => request<Match[]>("/matches/upcoming"),
  recentResults: () => request<Match[]>("/matches/recent"),
  matchesByDate: (date: string) =>
    request<Match[]>(`/matches/by-date?match_date=${date}`),
  matchesByCompetition: (competitionId: number) =>
    request<Match[]>(`/matches/by-competition/${competitionId}`),
  matchesByTeam: (teamId: number) =>
    request<Match[]>(`/matches/by-team/${teamId}`),

  // Ingestion
  runChampionsLeagueIngestion: () =>
    request<IngestionResult>("/ingestion/champions-league/run", { method: "POST" }),
  runCompetitionHistory: (
    competitionCode: string,
    startSeason: number,
    endSeason: number,
  ) =>
    request<IngestionResult>(
      `/ingestion/${competitionCode}/history/run?start_season=${startSeason}&end_season=${endSeason}`,
      { method: "POST" },
    ),
};
