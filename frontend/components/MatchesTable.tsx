"use client";

import { useState } from "react";
import type { Match } from "@/types/match";
import StatusBadge from "@/components/StatusBadge";

const COMPETITION_COLORS: Record<string, string> = {
  "Champions League": "#1a56db",
  "Europa League":    "#ea580c",
  "Premier League":   "#7c3aed",
  "La Liga":          "#dc2626",
  "Bundesliga":       "#d97706",
  "Serie A":          "#0e7490",
  "Ligue 1":          "#059669",
};

function competitionColor(name: string) {
  return COMPETITION_COLORS[name] ?? "#64748b";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Lima",
  }).format(new Date(value));
}

function TeamCrest({
  crest,
  name,
}: {
  crest?: string | null;
  name: string;
}) {
  const [error, setError] = useState(false);

  if (!crest || error) {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
        {name.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={crest}
      alt={name}
      width={28}
      height={28}
      className="h-7 w-7 shrink-0 object-contain"
      onError={() => setError(true)}
    />
  );
}

export default function MatchesTable({ matches }: { matches: Match[] }) {
  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white p-12 text-center">
        <p className="text-sm font-medium text-slate-500">No matches found</p>
        <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or run an ingestion</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-slate-50">
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Date</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Competition</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 min-w-[280px]">Match</th>
              <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">Score</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Round</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">Venue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {matches.map((match) => (
              <tr key={match.id} className="hover:bg-slate-50/70 transition-colors">
                {/* Date */}
                <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">
                  {formatDate(match.match_date)}
                </td>

                {/* Competition badge */}
                <td className="whitespace-nowrap px-4 py-3.5">
                  <span
                    className="inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold text-white"
                    style={{ backgroundColor: competitionColor(match.competition_name) }}
                  >
                    {match.competition_name}
                  </span>
                </td>

                {/* Match — home vs away with crests */}
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    {/* Home team */}
                    <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                      <span className="truncate text-sm font-semibold text-ink">
                        {match.home_team_name}
                      </span>
                      <TeamCrest crest={match.home_team_crest} name={match.home_team_name} />
                    </div>

                    <span className="shrink-0 text-xs font-bold text-slate-400 px-1">vs</span>

                    {/* Away team */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <TeamCrest crest={match.away_team_crest} name={match.away_team_name} />
                      <span className="truncate text-sm font-semibold text-ink">
                        {match.away_team_name}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Score */}
                <td className="whitespace-nowrap px-4 py-3.5 text-center">
                  {match.home_score != null && match.away_score != null ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1 text-sm font-bold text-white tabular-nums">
                      {match.home_score}
                      <span className="text-slate-500">:</span>
                      {match.away_score}
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </td>

                {/* Round */}
                <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">
                  {match.round || match.stage || "—"}
                </td>

                {/* Status */}
                <td className="whitespace-nowrap px-4 py-3.5">
                  <StatusBadge status={match.status} />
                </td>

                {/* Venue */}
                <td className="px-4 py-3.5 text-xs text-slate-500 max-w-[160px] truncate">
                  {match.venue_name || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-line bg-slate-50 px-4 py-2.5 text-xs text-slate-400">
        {matches.length.toLocaleString()} {matches.length === 1 ? "match" : "matches"}
      </div>
    </div>
  );
}
