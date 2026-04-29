"use client";

import { CheckCircle2, Loader2, Play, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";

import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import MatchesTable from "@/components/MatchesTable";
import { api, SUPPORTED_COMPETITIONS, type IngestionResult } from "@/lib/api";
import type { Match } from "@/types/match";

const SEASON_OPTIONS = [2020, 2021, 2022, 2023, 2024, 2025];

export default function IngestionPage() {
  const [selectedCode, setSelectedCode] = useState("CL");
  const [startSeason, setStartSeason] = useState(2023);
  const [endSeason, setEndSeason] = useState(2025);
  const [running, setRunning] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [result, setResult] = useState<IngestionResult | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    setLoadingMatches(true);
    setError("");
    try {
      setMatches(await api.matches());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load matches");
    } finally {
      setLoadingMatches(false);
    }
  }

  async function runIngestion() {
    if (endSeason < startSeason) {
      setError("End season must be greater than or equal to start season");
      return;
    }
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const ingestionResult = await api.runCompetitionHistory(selectedCode, startSeason, endSeason);
      setResult(ingestionResult);
      await loadMatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ingestion failed");
    } finally {
      setRunning(false);
    }
  }

  const selectedLeague = SUPPORTED_COMPETITIONS.find((c) => c.code === selectedCode);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Data pipeline</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Ingestion</h1>
        <p className="mt-1 text-sm text-slate-500">
          Fetch and store historical match data from football-data.org for any competition.
        </p>
      </div>

      {/* Ingestion controls */}
      <section className="rounded-xl border border-line bg-white shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-slate-50">
          <h2 className="text-sm font-semibold text-ink">Configure ingestion</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* League selector */}
          <div>
            <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Competition
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {SUPPORTED_COMPETITIONS.map((comp) => (
                <button
                  key={comp.code}
                  type="button"
                  onClick={() => setSelectedCode(comp.code)}
                  className={`relative flex flex-col items-center gap-1.5 rounded-lg border-2 px-2 py-3 text-center transition-all ${
                    selectedCode === comp.code
                      ? "border-current shadow-sm"
                      : "border-line hover:border-slate-300 bg-white"
                  }`}
                  style={
                    selectedCode === comp.code
                      ? { borderColor: comp.color, backgroundColor: `${comp.color}10` }
                      : {}
                  }
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: comp.color }}
                  />
                  <span
                    className="text-[11px] font-bold"
                    style={selectedCode === comp.code ? { color: comp.color } : { color: "#64748b" }}
                  >
                    {comp.code}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight">{comp.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Season range */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                From season
              </label>
              <select
                value={startSeason}
                onChange={(e) => setStartSeason(Number(e.target.value))}
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                {SEASON_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}/{s + 1}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                To season
              </label>
              <select
                value={endSeason}
                onChange={(e) => setEndSeason(Number(e.target.value))}
                className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                {SEASON_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}/{s + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={runIngestion}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: selectedLeague?.color ?? "#0f172a" }}
            >
              {running ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Play size={16} aria-hidden="true" />
              )}
              {running
                ? `Fetching ${selectedLeague?.name ?? selectedCode}…`
                : `Ingest ${selectedLeague?.name ?? selectedCode}`}
            </button>

            <button
              type="button"
              onClick={loadMatches}
              disabled={loadingMatches}
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCcw size={15} aria-hidden="true" />
              Refresh
            </button>
          </div>

          {/* Result banner */}
          {result && (
            <div className="flex items-start gap-3 rounded-lg bg-emerald-50 border border-emerald-200 p-4">
              <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
              <div className="text-sm text-emerald-800">
                <p className="font-semibold">{result.competition} — {result.message}</p>
                <p className="mt-0.5 text-emerald-700">
                  Found {result.records_found} · Inserted {result.records_inserted} · Updated {result.records_updated}
                </p>
                {result.skipped_seasons.length > 0 && (
                  <p className="mt-1 text-xs text-emerald-600">
                    Skipped (restricted): {result.skipped_seasons.join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {error && <ErrorState message={error} />}

      {/* Matches */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Stored matches</h2>
          <span className="text-xs text-slate-400">{matches.length.toLocaleString()} total</span>
        </div>
        {loadingMatches ? <LoadingState label="Loading matches…" /> : <MatchesTable matches={matches} />}
      </section>
    </div>
  );
}
