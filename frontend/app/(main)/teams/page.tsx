import ErrorState from "@/components/ErrorState";
import { api } from "@/lib/api";

export default async function TeamsPage() {
  try {
    const teams = await api.teams();

    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase text-accent">Catalog</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Teams</h1>
        </div>
        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
          <table className="min-w-full divide-y divide-line text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Slug</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {teams.map((team) => (
                <tr key={team.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-ink">{team.name}</td>
                  <td className="px-4 py-3 text-slate-600">{team.country_name || "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{team.slug}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  } catch (error) {
    return <ErrorState message={`Could not load teams. ${error instanceof Error ? error.message : ""}`} />;
  }
}

