import DashboardCards from "@/components/DashboardCards";
import ErrorState from "@/components/ErrorState";
import MatchesTable from "@/components/MatchesTable";
import { api } from "@/lib/api";

export default async function DashboardPage() {
  try {
    const [competitions, teams, matches, upcoming] = await Promise.all([
      api.competitions(),
      api.teams(),
      api.matches(),
      api.upcomingMatches(),
    ]);

    return (
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Overview</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">Football Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Normalized match data across {competitions.length} competition{competitions.length !== 1 ? "s" : ""}.
          </p>
        </div>

        <DashboardCards
          competitions={competitions.length}
          teams={teams.length}
          matches={matches.length}
          upcoming={upcoming.length}
        />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Recent matches</h2>
            <span className="text-xs text-slate-400">Last 8 by date</span>
          </div>
          <MatchesTable matches={matches.slice(0, 8)} />
        </section>
      </div>
    );
  } catch (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-ink">Football Analytics</h1>
        <ErrorState message={`Could not load dashboard. ${error instanceof Error ? error.message : ""}`} />
      </div>
    );
  }
}
