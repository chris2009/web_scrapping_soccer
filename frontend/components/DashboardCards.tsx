import { CalendarClock, CheckCircle2, Shield, Users } from "lucide-react";

type Props = {
  competitions: number;
  teams: number;
  matches: number;
  upcoming: number;
};

const cardConfig = [
  { key: "competitions", label: "Competitions", icon: Shield },
  { key: "teams", label: "Teams", icon: Users },
  { key: "matches", label: "Matches", icon: CheckCircle2 },
  { key: "upcoming", label: "Upcoming", icon: CalendarClock },
] as const;

export default function DashboardCards({ competitions, teams, matches, upcoming }: Props) {
  const values = { competitions, teams, matches, upcoming };

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cardConfig.map((card) => {
        const Icon = card.icon;
        return (
          <article key={card.key} className="rounded-lg border border-line bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <Icon className="text-accent" size={20} aria-hidden="true" />
            </div>
            <p className="mt-4 text-3xl font-semibold text-ink">{values[card.key]}</p>
          </article>
        );
      })}
    </section>
  );
}

