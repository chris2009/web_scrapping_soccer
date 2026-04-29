const statusConfig: Record<string, { label: string; className: string; dot: string }> = {
  scheduled: {
    label: "Scheduled",
    className: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-400",
  },
  live: {
    label: "Live",
    className: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500 animate-pulse",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  postponed: {
    label: "Postponed",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-rose-50 text-rose-700 ring-rose-200",
    dot: "bg-rose-400",
  },
  suspended: {
    label: "Suspended",
    className: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  },
};

export default function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
