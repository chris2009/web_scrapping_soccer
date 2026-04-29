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
      <div className="space-y-6">
        <section>
          <p className="text-sm font-semibold uppercase text-accent">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Football match data</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Normalized match data collected through the Champions League pilot ingestion flow.
          </p>
        </section>

        <DashboardCards
          competitions={competitions.length}
          teams={teams.length}
          matches={matches.length}
          upcoming={upcoming.length}
        />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Current pilot matches</h2>
          </div>
          <MatchesTable matches={matches.slice(0, 8)} />
        </section>
      </div>
    );
  } catch (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-semibold text-ink">Football match data</h1>
        <ErrorState message={`Could not load dashboard data. ${error instanceof Error ? error.message : ""}`} />
      </div>
    );
  }
}
