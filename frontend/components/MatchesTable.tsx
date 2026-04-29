"use client";

import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useState } from "react";

import StatusBadge from "@/components/StatusBadge";
import type { Match } from "@/types/match";

const COMPETITION_COLORS: Record<string, string> = {
  "Champions League": "#1a56db",
  "Europa League":    "#ea580c",
  "Premier League":   "#7c3aed",
  "La Liga":          "#dc2626",
  "Bundesliga":       "#d97706",
  "Serie A":          "#0e7490",
  "Ligue 1":          "#059669",
};

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40];

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

function TeamCrest({ crest, name }: { crest?: string | null; name: string }) {
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

function matchMatchesSearch(match: Match, query: string): boolean {
  const q = query.toLowerCase();
  return (
    match.home_team_name.toLowerCase().includes(q) ||
    match.away_team_name.toLowerCase().includes(q) ||
    match.competition_name.toLowerCase().includes(q) ||
    (match.venue_name ?? "").toLowerCase().includes(q) ||
    (match.stage ?? "").toLowerCase().includes(q) ||
    (match.round ?? "").toLowerCase().includes(q) ||
    match.season_name.toLowerCase().includes(q)
  );
}

export default function MatchesTable({ matches }: { matches: Match[] }) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filtered = search.trim()
    ? matches.filter((m) => matchMatchesSearch(m, search.trim()))
    : matches;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const visible = filtered.slice(start, start + pageSize);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handlePageSize(size: number) {
    setPageSize(size);
    setPage(1);
  }

  if (matches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-white p-12 text-center">
        <p className="text-sm font-medium text-slate-500">No matches found</p>
        <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or run an ingestion</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search + page size controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search teams, competition, venue…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg border border-line bg-white py-2 pl-9 pr-9 text-sm text-ink placeholder:text-slate-400 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Page size selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 mr-1">Show</span>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => handlePageSize(size)}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                pageSize === size
                  ? "bg-ink text-white"
                  : "border border-line bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Result count */}
        <span className="ml-auto text-xs text-slate-400">
          {filtered.length !== matches.length
            ? `${filtered.length} of ${matches.length.toLocaleString()} matches`
            : `${matches.length.toLocaleString()} matches`}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-soft">
        {visible.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No matches match &quot;{search}&quot;
          </div>
        ) : (
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
                {visible.map((match) => (
                  <tr key={match.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">
                      {formatDate(match.match_date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <span
                        className="inline-flex items-center rounded-md px-2 py-1 text-[11px] font-semibold text-white"
                        style={{ backgroundColor: competitionColor(match.competition_name) }}
                      >
                        {match.competition_name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1 justify-end">
                          <span className="truncate text-sm font-semibold text-ink">{match.home_team_name}</span>
                          <TeamCrest crest={match.home_team_crest} name={match.home_team_name} />
                        </div>
                        <span className="shrink-0 text-xs font-bold text-slate-400 px-1">vs</span>
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <TeamCrest crest={match.away_team_crest} name={match.away_team_name} />
                          <span className="truncate text-sm font-semibold text-ink">{match.away_team_name}</span>
                        </div>
                      </div>
                    </td>
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
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">
                      {match.round || match.stage || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <StatusBadge status={match.status} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 max-w-[160px] truncate">
                      {match.venue_name || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination footer */}
        <div className="flex items-center justify-between border-t border-line bg-slate-50 px-4 py-2.5">
          <span className="text-xs text-slate-400">
            {filtered.length === 0
              ? "No results"
              : `Showing ${start + 1}–${Math.min(start + pageSize, filtered.length)} of ${filtered.length.toLocaleString()}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={13} />
              Prev
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-slate-400">…</span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p as number)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      safePage === p
                        ? "bg-ink text-white"
                        : "border border-line bg-white text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
