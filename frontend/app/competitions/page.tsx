import ErrorState from "@/components/ErrorState";
import { api } from "@/lib/api";
import { SUPPORTED_COMPETITIONS } from "@/lib/api";

const COMPETITION_COLORS: Record<string, string> = Object.fromEntries(
  SUPPORTED_COMPETITIONS.map((c) => [c.name, c.color])
);

export default async function CompetitionsPage() {
  try {
    const competitions = await api.competitions();

    return (
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Catalog</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">Competitions</h1>
          <p className="mt-1 text-sm text-slate-500">{competitions.length} competition{competitions.length !== 1 ? "s" : ""} in the database</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {competitions.map((competition) => {
            const color = COMPETITION_COLORS[competition.name] ?? "#64748b";
            return (
              <article
                key={competition.id}
                className="relative overflow-hidden rounded-xl border border-line bg-white shadow-soft"
              >
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: color }}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-ink">{competition.name}</p>
                      <p className="mt-0.5 text-sm text-slate-500">{competition.region || "Global"}</p>
                    </div>
                    <span
                      className="rounded-md px-2 py-1 text-[11px] font-bold text-white shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {competition.slug.toUpperCase().slice(0, 3)}
                    </span>
                  </div>
                  <p className="mt-3 font-mono text-[11px] text-slate-400">{competition.slug}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <ErrorState
        message={`Could not load competitions. ${error instanceof Error ? error.message : ""}`}
      />
    );
  }
}
