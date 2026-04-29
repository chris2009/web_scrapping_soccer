"use client";

import { DatabaseZap, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";

import ErrorState from "@/components/ErrorState";
import LoadingState from "@/components/LoadingState";
import MatchesTable from "@/components/MatchesTable";
import { api, type IngestionResult } from "@/lib/api";
import type { Match } from "@/types/match";

export default function IngestionPage() {
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
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const ingestionResult = await api.runChampionsLeagueIngestion();
      setResult(ingestionResult);
      await loadMatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not run ingestion");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase text-accent">Pilot ingestion</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Champions League</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Execute the simulated ingestion flow and inspect the matches stored through the backend API.
        </p>
      </div>

      <section className="rounded-lg border border-line bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={runIngestion}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-md bg-pitch px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <DatabaseZap size={18} aria-hidden="true" />
            {running ? "Running..." : "Run pilot ingestion"}
          </button>
          <button
            type="button"
            onClick={loadMatches}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <RefreshCcw size={18} aria-hidden="true" />
            Refresh matches
          </button>
        </div>

        {result ? (
          <div className="mt-4 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
            {result.message}. Found {result.records_found}, inserted {result.records_inserted}, updated{" "}
            {result.records_updated}.
          </div>
        ) : null}
      </section>

      {error ? <ErrorState message={error} /> : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ink">Stored matches</h2>
        {loadingMatches ? <LoadingState label="Loading stored matches..." /> : <MatchesTable matches={matches} />}
      </section>
    </div>
  );
}

