"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  DatabaseZap,
  Home,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/",            label: "Dashboard",   icon: Home },
  { href: "/competitions",label: "Competitions", icon: Shield },
  { href: "/teams",       label: "Teams",        icon: Users },
  { href: "/matches",     label: "Matches",      icon: CalendarDays },
  { href: "/ingestion",   label: "Ingestion",    icon: DatabaseZap },
];

const leagues = [
  { code: "CL",  name: "Champions League", color: "#1a56db" },
  { code: "PL",  name: "Premier League",   color: "#7c3aed" },
  { code: "PD",  name: "La Liga",          color: "#dc2626" },
  { code: "BL1", name: "Bundesliga",       color: "#d97706" },
  { code: "SA",  name: "Serie A",          color: "#0e7490" },
  { code: "FL1", name: "Ligue 1",          color: "#059669" },
  { code: "EL",  name: "Europa League",    color: "#ea580c" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-sidebar flex flex-col z-20 overflow-y-auto">
      {/* Branding */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-700/60">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pitch">
          <TrendingUp size={18} className="text-white" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">Football Data</p>
          <p className="text-xs text-sidebar-text">Analytics Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium mb-0.5 transition-colors ${
                active
                  ? "bg-sidebar-active text-white"
                  : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
              }`}
            >
              <Icon size={17} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}

        {/* Leagues quick list */}
        <p className="px-3 mt-6 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Leagues
        </p>
        {leagues.map((league) => (
          <div
            key={league.code}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-colors mb-0.5"
          >
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: league.color }}
            />
            <span className="truncate">{league.name}</span>
            <span className="ml-auto text-[10px] font-mono text-slate-600">{league.code}</span>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-700/60">
        <p className="text-[10px] text-slate-600 leading-relaxed">
          Data via football-data.org
        </p>
        <p className="text-[10px] text-slate-600">
          FastAPI · Supabase · Next.js
        </p>
      </div>
    </aside>
  );
}
