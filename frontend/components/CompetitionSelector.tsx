"use client";

import type { Competition } from "@/types/competition";

type Props = {
  competitions: Competition[];
  value: string;
  onChange: (value: string) => void;
};

export default function CompetitionSelector({ competitions, value, onChange }: Props) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Competition</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-accent"
      >
        <option value="">All competitions</option>
        {competitions.map((competition) => (
          <option key={competition.id} value={competition.id}>
            {competition.name}
          </option>
        ))}
      </select>
    </label>
  );
}

