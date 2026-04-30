"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Camera,
  Check,
  DatabaseZap,
  Home,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Shield,
  TrendingUp,
  Upload,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { getAuthInfo, type AuthInfo } from "@/lib/auth";
import { useSidebar } from "@/context/SidebarContext";

const commonNav = [
  { href: "/",             label: "Dashboard",    icon: Home },
  { href: "/competitions", label: "Competitions",  icon: Shield },
  { href: "/teams",        label: "Teams",         icon: Users },
  { href: "/matches",      label: "Matches",       icon: CalendarDays },
];

const adminNav = [
  { href: "/ingestion",    label: "Ingestion",        icon: DatabaseZap },
  { href: "/users",        label: "User Management",  icon: UsersRound },
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

// ─── Avatar edit modal ───────────────────────────────────────────────────────

function resizeImage(file: File, maxPx = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function AvatarEditModal({
  current,
  onClose,
  onSaved,
}: {
  current: string | null;
  onClose: () => void;
  onSaved: (url: string) => void;
}) {
  const [url, setUrl] = useState(current ?? "");
  const [preview, setPreview] = useState(current ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("File too large (max 5 MB)"); return; }
    try {
      const b64 = await resizeImage(file);
      setUrl(b64);
      setPreview(b64);
      setError("");
    } catch { setError("Could not process image"); }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: url || null }),
      });
      if (!res.ok) { setError("Could not save"); return; }
      onSaved(url);
      onClose();
    } catch { setError("Connection error"); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-sm font-bold text-white">Edit profile photo</h3>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Preview */}
          <div className="flex justify-center">
            {preview ? (
              <img src={preview} alt="preview" className="h-24 w-24 rounded-full object-cover ring-4 ring-white/10" />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-2xl font-bold text-white ring-4 ring-white/10">
                ?
              </div>
            )}
          </div>

          {/* Upload button */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
          >
            <Upload size={15} />
            Upload photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

          {/* Or URL */}
          <div>
            <p className="mb-1.5 text-[11px] text-slate-500 text-center">or paste an image URL</p>
            <input
              type="url"
              value={url.startsWith("data:") ? "" : url}
              onChange={(e) => { setUrl(e.target.value); setPreview(e.target.value); }}
              placeholder="https://..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              suppressHydrationWarning
            />
          </div>

          {error && <p className="text-xs text-red-400 text-center">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-slate-400 hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {saving ? "Saving…" : <><Check size={14} /> Save</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Avatar display ──────────────────────────────────────────────────────────

function UserAvatar({ username, avatarUrl, collapsed, onEdit }: {
  username: string;
  avatarUrl: string | null;
  collapsed: boolean;
  onEdit: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const size = collapsed ? "h-9 w-9" : "h-11 w-11";

  return (
    <div className="relative group shrink-0">
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={username}
          className={`${size} rounded-full object-cover ring-2 ring-slate-600 transition-all duration-300`}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className={`${size} flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 font-bold text-white ring-2 ring-slate-600 transition-all duration-300 ${collapsed ? "text-xs" : "text-sm"}`}>
          {username.slice(0, 2).toUpperCase()}
        </div>
      )}
      <button
        type="button"
        onClick={onEdit}
        title="Edit photo"
        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Camera size={collapsed ? 12 : 14} className="text-white" />
      </button>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const { collapsed, toggle } = useSidebar();

  const [authInfo, setAuthInfo]   = useState<AuthInfo | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [editingAvatar, setEditingAvatar] = useState(false);

  useEffect(() => {
    const info = getAuthInfo();
    setAuthInfo(info);
    if (info) {
      fetch("/api/users/me")
        .then((r) => r.json())
        .then((d) => { if (d.avatar_url) setAvatarUrl(d.avatar_url); })
        .catch(() => {});
    }
  }, []);

  const isAdmin  = authInfo?.role === "admin";
  const navItems = isAdmin ? [...commonNav, ...adminNav] : commonNav;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <aside
        className="fixed top-0 left-0 h-screen bg-sidebar flex flex-col z-20 overflow-hidden transition-all duration-300"
        style={{ width: collapsed ? "4rem" : "16rem" }}
      >
        {/* Branding + toggle */}
        <div className="flex items-center border-b border-slate-700/60 px-3 py-5 shrink-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pitch">
            <TrendingUp size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-bold text-white leading-tight truncate">Football Data</p>
              <p className="text-xs text-sidebar-text truncate">Analytics Platform</p>
            </div>
          )}
          <button
            type="button"
            onClick={toggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-sidebar-hover hover:text-white transition-colors"
          >
            {collapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
          {!collapsed && (
            <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Navigation
            </p>
          )}
          {navItems.map((item) => {
            const Icon   = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-lg px-2 py-2.5 text-sm font-medium mb-0.5 transition-colors ${
                  collapsed ? "justify-center" : "gap-3"
                } ${
                  active
                    ? "bg-sidebar-active text-white"
                    : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}

          {/* Leagues */}
          {!collapsed && (
            <>
              <p className="px-2 mt-5 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                Leagues
              </p>
              {leagues.map((league) => (
                <div
                  key={league.code}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-colors mb-0.5"
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: league.color }} />
                  <span className="truncate">{league.name}</span>
                  <span className="ml-auto text-[10px] font-mono text-slate-600">{league.code}</span>
                </div>
              ))}
            </>
          )}

          {/* League dots when collapsed */}
          {collapsed && (
            <div className="mt-4 flex flex-col items-center gap-1.5">
              {leagues.map((l) => (
                <span
                  key={l.code}
                  title={l.name}
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: l.color }}
                />
              ))}
            </div>
          )}
        </nav>

        {/* User + logout */}
        <div className="border-t border-slate-700/60 px-2 py-3 space-y-1 shrink-0">
          {authInfo && (
            <div className={`flex items-center gap-2 px-1 py-1.5 mb-1 ${collapsed ? "justify-center" : ""}`}>
              <UserAvatar
                username={authInfo.username}
                avatarUrl={avatarUrl}
                collapsed={collapsed}
                onEdit={() => setEditingAvatar(true)}
              />
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">{authInfo.username}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{authInfo.role}</p>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Sign out" : undefined}
            className={`flex w-full items-center rounded-lg px-2 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <LogOut size={17} />
            {!collapsed && "Sign out"}
          </button>

          {!collapsed && (
            <p className="px-2 text-[10px] text-slate-700">FastAPI · Supabase · Next.js</p>
          )}
        </div>
      </aside>

      {editingAvatar && (
        <AvatarEditModal
          current={avatarUrl}
          onClose={() => setEditingAvatar(false)}
          onSaved={(url) => setAvatarUrl(url)}
        />
      )}
    </>
  );
}
