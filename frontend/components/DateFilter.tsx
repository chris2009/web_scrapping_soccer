"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function DateFilter({ value, onChange }: Props) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Date</span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-accent"
      />
    </label>
  );
}

