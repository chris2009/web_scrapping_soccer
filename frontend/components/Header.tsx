import { Activity } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pitch text-white">
            <Activity aria-hidden="true" size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Football Data App</p>
            <p className="text-xs text-slate-500">Champions League pilot</p>
          </div>
        </div>
        <div className="hidden rounded-full border border-line px-3 py-1 text-xs font-medium text-slate-600 sm:block">
          FastAPI + Supabase + Next.js
        </div>
      </div>
    </header>
  );
}

