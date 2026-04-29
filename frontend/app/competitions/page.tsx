import ErrorState from "@/components/ErrorState";
import { api } from "@/lib/api";

export default async function CompetitionsPage() {
  try {
    const competitions = await api.competitions();

    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase text-accent">Catalog</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Competitions</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {competitions.map((competition) => (
            <article key={competition.id} className="rounded-lg border border-line bg-white p-5 shadow-soft">
              <p className="text-lg font-semibold text-ink">{competition.name}</p>
              <p className="mt-1 text-sm text-slate-500">{competition.region || "Global"}</p>
              <p className="mt-4 text-xs font-medium uppercase text-slate-400">{competition.slug}</p>
            </article>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    return <ErrorState message={`Could not load competitions. ${error instanceof Error ? error.message : ""}`} />;
  }
}

