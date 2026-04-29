export default function LoadingState({ label = "Loading data..." }: { label?: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-8 text-center text-sm font-medium text-slate-500 shadow-soft">
      {label}
    </div>
  );
}

