"use client";

import type { Team } from "@/types/team";

type Props = {
  teams: Team[];
  value: string;
  onChange: (value: string) => void;
};

export default function TeamSelector({ teams, value, onChange }: Props) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Team</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-accent"
      >
        <option value="">All teams</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
    </label>
  );
}

