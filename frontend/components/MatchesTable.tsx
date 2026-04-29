import type { Match } from "@/types/match";
import StatusBadge from "@/components/StatusBadge";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Lima",
  }).format(new Date(value));
}

export default function MatchesTable({ matches }: { matches: Match[] }) {
  if (matches.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center text-sm text-slate-500">
        No matches found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-line text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Competition</th>
              <th className="px-4 py-3">Match</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Venue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {matches.map((match) => (
              <tr key={match.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{formatDate(match.match_date)}</td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">{match.competition_name}</td>
                <td className="px-4 py-3 text-slate-800">
                  {match.home_team_name} <span className="text-slate-400">vs</span> {match.away_team_name}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                  {match.home_score ?? "-"} : {match.away_score ?? "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {match.stage || "-"} {match.round ? `/${match.round}` : ""}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge status={match.status} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{match.venue_name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
