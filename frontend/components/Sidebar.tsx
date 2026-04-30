"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  DatabaseZap,
  Home,
  LogOut,
  Shield,
  TrendingUp,
  User,
  Users,
  UsersRound,
} from "lucide-react";
import { getAuthInfo, type AuthInfo } from "@/lib/auth";

function UserAvatar({ username }: { username: string }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => { if (d.avatar_url) setAvatarUrl(d.avatar_url); })
      .catch(() => {});
  }, []);

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-slate-600"
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white ring-2 ring-slate-600">
      {username.slice(0, 2).toUpperCase()}
    </div>
  );
}

const commonNav = [
  { href: "/",             label: "Dashboard",   icon: Home },
  { href: "/competitions", label: "Competitions", icon: Shield },
  { href: "/teams",        label: "Teams",        icon: Users },
  { href: "/matches",      label: "Matches",      icon: CalendarDays },
];

const adminNav = [
  { href: "/ingestion", label: "Ingestion",      icon: DatabaseZap },
  { href: "/users",     label: "User Management", icon: UsersRound },
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
  const router   = useRouter();
  const [authInfo, setAuthInfo] = useState<AuthInfo | null>(null);

  useEffect(() => {
    setAuthInfo(getAuthInfo());
  }, []);

  const isAdmin = authInfo?.role === "admin";
  const navItems = isAdmin ? [...commonNav, ...adminNav] : commonNav;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

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
          const Icon   = item.icon;
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

        {/* Leagues */}
        <p className="px-3 mt-6 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Leagues
        </p>
        {leagues.map((league) => (
          <div
            key={league.code}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-colors mb-0.5"
          >
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: league.color }} />
            <span className="truncate">{league.name}</span>
            <span className="ml-auto text-[10px] font-mono text-slate-600">{league.code}</span>
          </div>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-slate-700/60 space-y-1">
        {authInfo && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <UserAvatar username={authInfo.username} />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{authInfo.username}</p>
              <p className="text-[10px] text-slate-500 capitalize">{authInfo.role}</p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={17} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
