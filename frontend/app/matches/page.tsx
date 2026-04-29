"use client";

import { RefreshCcw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import CompetitionSelector from "@/components/CompetitionSelector";
import DateFilter from "@/components/DateFilter";
import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import MatchesTable from "@/components/MatchesTable";
import TeamSelector from "@/components/TeamSelector";
import { api } from "@/lib/api";
import type { Competition } from "@/types/competition";
import type { Match } from "@/types/match";
import type { Team } from "@/types/team";

type ViewMode = "all" | "upcoming" | "recent";

export default function MatchesPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [competitionId, setCompetitionId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [date, setDate] = useState("");
  const [mode, setMode] = useState<ViewMode>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.competitions(), api.teams()])
      .then(([competitionData, teamData]) => {
        setCompetitions(competitionData);
        setTeams(teamData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load filters"));
  }, []);

  useEffect(() => {
    loadMatches();
  }, [mode]);

  async function loadMatches() {
    setLoading(true);
    setError("");
    try {
      let data: Match[];
      if (date) {
        data = await api.matchesByDate(date);
      } else if (teamId) {
        data = await api.matchesByTeam(Number(teamId));
      } else if (competitionId) {
        data = await api.matchesByCompetition(Number(competitionId));
      } else if (mode === "upcoming") {
        data = await api.upcomingMatches();
      } else if (mode === "recent") {
        data = await api.recentResults();
      } else {
        data = await api.matches();
      }
      setMatches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load matches");
    } finally {
      setLoading(false);
    }
  }

  function clearFilters() {
    setCompetitionId("");
    setTeamId("");
    setDate("");
    setMode("all");
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-accent">Explorer</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Matches</h1>
      </div>

      <section className="rounded-lg border border-line bg-white p-4 shadow-soft">
        <div className="grid gap-4 md:grid-cols-3">
          <CompetitionSelector competitions={competitions} value={competitionId} onChange={setCompetitionId} />
          <TeamSelector teams={teams} value={teamId} onChange={setTeamId} />
          <DateFilter value={date} onChange={setDate} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(["all", "upcoming", "recent"] as ViewMode[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                mode === item ? "bg-pitch text-white" : "border border-line bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item}
            </button>
          ))}
          <button
            type="button"
            onClick={loadMatches}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white"
          >
            <Search size={16} aria-hidden="true" />
            Apply
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <X size={16} aria-hidden="true" />
            Clear
          </button>
          <button
            type="button"
            onClick={loadMatches}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCcw size={16} aria-hidden="true" />
            Refresh
          </button>
        </div>
      </section>

      {error ? <ErrorState message={error} /> : null}
      {loading ? <LoadingState label="Loading matches..." /> : <MatchesTable matches={matches} />}
    </div>
  );
}

