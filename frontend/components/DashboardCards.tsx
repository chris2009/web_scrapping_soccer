import { CalendarClock, CheckCircle2, Shield, Users } from "lucide-react";

type Props = {
  competitions: number;
  teams: number;
  matches: number;
  upcoming: number;
};

const cardConfig = [
  {
    key: "competitions" as const,
    label: "Competitions",
    icon: Shield,
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  {
    key: "teams" as const,
    label: "Teams",
    icon: Users,
    gradient: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
    text: "text-violet-600",
  },
  {
    key: "matches" as const,
    label: "Total Matches",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
  },
  {
    key: "upcoming" as const,
    label: "Upcoming",
    icon: CalendarClock,
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    text: "text-amber-600",
  },
] as const;

export default function DashboardCards({ competitions, teams, matches, upcoming }: Props) {
  const values = { competitions, teams, matches, upcoming };

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.key}
            className="relative overflow-hidden rounded-xl bg-white border border-line shadow-soft"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-[0.04]`} />
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.bg}`}>
                  <Icon className={card.text} size={18} aria-hidden="true" />
                </div>
              </div>
              <p className="text-3xl font-bold text-ink">{values[card.key].toLocaleString()}</p>
            </div>
          </article>
        );
      })}
    </section>
  );
}
