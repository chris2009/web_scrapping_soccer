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

const STATUS_OPTIONS = [
  { value: "",           label: "All statuses", dot: ""               },
  { value: "scheduled",  label: "Scheduled",    dot: "bg-sky-400"     },
  { value: "live",       label: "Live",         dot: "bg-red-500"     },
  { value: "completed",  label: "Completed",    dot: "bg-emerald-500" },
  { value: "postponed",  label: "Postponed",    dot: "bg-amber-400"   },
] as const;

export default function MatchesPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [competitionId, setCompetitionId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [date, setDate] = useState("");
  const [mode, setMode] = useState<ViewMode>("all");
  const [statusFilter, setStatusFilter] = useState("");
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
      const usesSpecificEndpoint = date || teamId || competitionId || mode === "upcoming" || mode === "recent";
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
        data = await api.matches(statusFilter || undefined);
      }
      if (statusFilter && usesSpecificEndpoint) {
        data = data.filter((m) => m.status === statusFilter);
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
    setStatusFilter("");
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Explorer</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Matches</h1>
        <p className="mt-1 text-sm text-slate-500">Filter and explore all stored match data</p>
      </div>

      <section className="rounded-xl border border-line bg-white shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-slate-50">
          <h2 className="text-sm font-semibold text-ink">Filters</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <CompetitionSelector competitions={competitions} value={competitionId} onChange={setCompetitionId} />
            <TeamSelector teams={teams} value={teamId} onChange={setTeamId} />
            <DateFilter value={date} onChange={setDate} />
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">View</span>
            {(["all", "upcoming", "recent"] as ViewMode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium capitalize transition-colors ${
                  mode === item
                    ? "bg-ink text-white"
                    : "border border-line bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Status</span>
            {STATUS_OPTIONS.map(({ value, label, dot }) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  statusFilter === value
                    ? "bg-ink text-white"
                    : "border border-line bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {dot && (
                  <span
                    className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${
                      statusFilter === value ? "bg-white" : dot
                    }`}
                  />
                )}
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={loadMatches}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
            >
              <Search size={15} aria-hidden="true" />
              Apply
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <X size={15} aria-hidden="true" />
              Clear
            </button>
            <button
              type="button"
              onClick={loadMatches}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <RefreshCcw size={15} aria-hidden="true" />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {error && <ErrorState message={error} />}
      {loading ? (
        <LoadingState label="Loading matches…" />
      ) : (
        <MatchesTable matches={matches} />
      )}
    </div>
  );
}
