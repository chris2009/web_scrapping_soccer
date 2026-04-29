"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, DatabaseZap, Home, ListChecks, Shield, Users } from "lucide-react";

const items = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/competitions", label: "Competitions", icon: Shield },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/matches", label: "Matches", icon: CalendarDays },
  { href: "/ingestion", label: "Ingestion", icon: DatabaseZap },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 lg:w-64">
      <nav className="rounded-lg border border-line bg-white p-3 shadow-soft lg:sticky lg:top-6">
        <div className="mb-2 hidden items-center gap-2 px-3 py-2 text-xs font-semibold uppercase text-slate-500 lg:flex">
          <ListChecks size={14} aria-hidden="true" />
          Menu
        </div>
        <div className="flex gap-2 overflow-x-auto lg:block">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium lg:mb-1 lg:gap-3 ${
                  active ? "bg-pitch text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
