"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

import DashboardCards from "@/components/DashboardCards";
import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import MatchesTable from "@/components/MatchesTable";
import StandingsWidget from "@/components/StandingsWidget";
import { api, type TopTeam, type GoalPoint } from "@/lib/api";
import type { Competition } from "@/types/competition";
import type { Match } from "@/types/match";
import type { Team } from "@/types/team";

const TopTeamsChart = dynamic(() => import("@/components/TopTeamsChart"), { ssr: false });
const GoalsLineChart = dynamic(() => import("@/components/GoalsLineChart"), { ssr: false });

export default function DashboardPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [topTeams, setTopTeams] = useState<TopTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TopTeam | null>(null);
  const [timeline, setTimeline] = useState<GoalPoint[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.competitions(),
      api.teams(),
      api.matches(),
      api.upcomingMatches(),
      api.topTeams(10),
    ])
      .then(([c, t, m, u, top]) => {
        setCompetitions(c);
        setTeams(t);
        setMatches(m);
        setUpcoming(u);
        setTopTeams(top);
        if (top.length > 0) loadTimeline(top[0]);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error loading dashboard"))
      .finally(() => setLoading(false));
  }, []);

  async function loadTimeline(team: TopTeam) {
    setSelectedTeam(team);
    setLoadingTimeline(true);
    try {
      setTimeline(await api.goalsTimeline(team.id));
    } catch {
      setTimeline([]);
    } finally {
      setLoadingTimeline(false);
    }
  }

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Overview</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Football Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          {competitions.length} competition{competitions.length !== 1 ? "s" : ""} · {matches.length.toLocaleString()} matches · {teams.length} teams
        </p>
      </div>

      {/* Stat cards */}
      <DashboardCards
        competitions={competitions.length}
        teams={teams.length}
        matches={matches.length}
        upcoming={upcoming.length}
      />

      {/* Charts row */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Top teams bar chart */}
        <div className="rounded-xl border border-line bg-white shadow-soft overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line bg-slate-50 px-5 py-3">
            <TrendingUp size={15} className="text-accent" />
            <h3 className="text-sm font-bold text-ink">Top 10 — Goals Scored</h3>
            <span className="ml-auto text-xs text-slate-400">all competitions</span>
          </div>
          <div className="p-4">
            <TopTeamsChart data={topTeams} />
          </div>
        </div>

        {/* Goals timeline */}
        <div className="rounded-xl border border-line bg-white shadow-soft overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-slate-50 px-5 py-3">
            <h3 className="text-sm font-bold text-ink">Goals per Match</h3>
            <div className="ml-auto flex flex-wrap gap-1">
              {topTeams.slice(0, 6).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => loadTimeline(t)}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                    selectedTeam?.id === t.id
                      ? "bg-ink text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t.crest_url && (
                    <img src={t.crest_url} alt="" className="h-3.5 w-3.5 object-contain" />
                  )}
                  {t.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            {loadingTimeline ? (
              <div className="flex h-52 items-center justify-center text-sm text-slate-400">Loading…</div>
            ) : (
              <GoalsLineChart data={timeline} teamName={selectedTeam?.name ?? ""} />
            )}
          </div>
        </div>
      </div>

      {/* Standings + top performers */}
      <div className="grid gap-6 xl:grid-cols-2">
        <StandingsWidget />

        <div className="rounded-xl border border-line bg-white shadow-soft overflow-hidden">
          <div className="border-b border-line bg-slate-50 px-5 py-3">
            <h3 className="text-sm font-bold text-ink">Top Performers</h3>
          </div>
          <div className="divide-y divide-line">
            {topTeams.slice(0, 8).map((team, i) => {
              const winRate = team.total_played > 0
                ? Math.round((team.total_wins / team.total_played) * 100)
                : 0;
              return (
                <div
                  key={team.id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => loadTimeline(team)}
                >
                  <span className="w-5 shrink-0 text-xs font-bold text-slate-400">{i + 1}</span>
                  {team.crest_url ? (
                    <img src={team.crest_url} alt={team.name} className="h-8 w-8 shrink-0 object-contain" />
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                      {team.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{team.name}</p>
                    <p className="text-[11px] text-slate-400">{team.total_played} matches</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-ink">
                      {team.total_goals} <span className="text-xs font-normal text-slate-400">gls</span>
                    </p>
                    <p className="text-[11px] font-medium text-emerald-600">{winRate}% wins</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent matches */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Recent matches</h2>
          <span className="text-xs text-slate-400">Last 8 by date</span>
        </div>
        <MatchesTable matches={matches.slice(0, 8)} />
      </section>
    </div>
  );
}
