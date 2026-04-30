"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TopTeam } from "@/lib/api";

const COLORS = [
  "#1a56db", "#7c3aed", "#dc2626", "#d97706",
  "#0e7490", "#059669", "#ea580c", "#0284c7",
  "#9333ea", "#db2777",
];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: TopTeam }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-line bg-white p-3 shadow-card text-xs">
      <div className="flex items-center gap-2 mb-2">
        {d.crest_url && (
          <img src={d.crest_url} alt={d.name} className="h-5 w-5 object-contain" />
        )}
        <span className="font-bold text-ink">{d.name}</span>
      </div>
      <p className="text-slate-600">Goals: <span className="font-semibold text-ink">{d.total_goals}</span></p>
      <p className="text-slate-600">Wins: <span className="font-semibold text-ink">{d.total_wins}</span></p>
      <p className="text-slate-600">Played: <span className="font-semibold text-ink">{d.total_played}</span></p>
    </div>
  );
}

export default function TopTeamsChart({ data }: { data: TopTeam[] }) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No match data available yet
      </div>
    );
  }

  const chartData = data.slice(0, 10).map((t) => ({
    ...t,
    shortName: t.name.length > 14 ? t.name.slice(0, 13) + "…" : t.name,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="shortName"
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total_goals" radius={[4, 4, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
