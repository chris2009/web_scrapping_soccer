"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { SUPPORTED_COMPETITIONS } from "@/lib/api";
import LoadingState from "@/components/LoadingState";

type TableRow = {
  position: number;
  team: { name: string; crest: string };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

const COMPETITION_COLORS: Record<string, string> = Object.fromEntries(
  SUPPORTED_COMPETITIONS.map((c) => [c.code, c.color])
);

export default function StandingsWidget() {
  const [selectedCode, setSelectedCode] = useState("PL");
  const [table, setTable] = useState<TableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStandings(selectedCode);
  }, [selectedCode]);

  async function loadStandings(code: string) {
    setLoading(true);
    setError("");
    setTable([]);
    try {
      const data = await api.standings(code) as {
        standings?: { type: string; table: TableRow[] }[]
      };
      const total = data.standings?.find((s) => s.type === "TOTAL");
      setTable(total?.table ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load standings");
    } finally {
      setLoading(false);
    }
  }

  const color = COMPETITION_COLORS[selectedCode] ?? "#64748b";

  return (
    <div className="rounded-xl border border-line bg-white shadow-soft overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-slate-50">
        <h3 className="text-sm font-bold text-ink">Standings</h3>
        <div className="flex gap-1 flex-wrap">
          {SUPPORTED_COMPETITIONS.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setSelectedCode(c.code)}
              className="rounded-md px-2 py-1 text-[10px] font-bold transition-colors"
              style={
                selectedCode === c.code
                  ? { backgroundColor: c.color, color: "#fff" }
                  : { backgroundColor: "#f1f5f9", color: "#64748b" }
              }
            >
              {c.code}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-80">
        {loading ? (
          <div className="p-6"><LoadingState label="Loading standings…" /></div>
        ) : error ? (
          <div className="p-6 text-xs text-center text-slate-500">{error}</div>
        ) : table.length === 0 ? (
          <div className="p-6 text-xs text-center text-slate-400">No standings available</div>
        ) : (
          <table className="min-w-full text-xs">
            <thead className="sticky top-0 bg-white border-b border-line">
              <tr>
                {["#", "Team", "P", "W", "D", "L", "GF", "GA", "GD", "Pts"].map((h) => (
                  <th key={h} className="px-2 py-2 text-[10px] font-semibold uppercase text-slate-400 text-center first:text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {table.map((row) => (
                <tr key={row.position} className="hover:bg-slate-50 transition-colors">
                  <td className="px-2 py-2 font-bold text-center" style={{ color }}>
                    {row.position}
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1.5">
                      {row.team.crest && (
                        <img src={row.team.crest} alt="" className="h-4 w-4 object-contain" />
                      )}
                      <span className="font-medium text-ink truncate max-w-[120px]">{row.team.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-center text-slate-600">{row.playedGames}</td>
                  <td className="px-2 py-2 text-center text-emerald-600 font-semibold">{row.won}</td>
                  <td className="px-2 py-2 text-center text-slate-500">{row.draw}</td>
                  <td className="px-2 py-2 text-center text-red-500">{row.lost}</td>
                  <td className="px-2 py-2 text-center text-slate-600">{row.goalsFor}</td>
                  <td className="px-2 py-2 text-center text-slate-600">{row.goalsAgainst}</td>
                  <td className="px-2 py-2 text-center font-medium" style={{ color: row.goalDifference >= 0 ? "#16a34a" : "#dc2626" }}>
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                  <td className="px-2 py-2 text-center font-bold text-ink">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
