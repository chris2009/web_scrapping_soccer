"use client";

import {
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import ErrorState from "@/components/ErrorState";

type UserRow = {
  id: number;
  username: string;
  email: string | null;
  role: "admin" | "user";
  is_active: boolean;
  created_at: string;
};

type FormState = {
  username: string;
  email: string;
  password: string;
  role: "admin" | "user";
  is_active: boolean;
};

const emptyForm: FormState = {
  username: "",
  email: "",
  password: "",
  role: "user",
  is_active: true,
};

function RoleBadge({ role }: { role: string }) {
  return role === "admin" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-violet-200">
      <Shield size={11} />
      Admin
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
      <User size={11} />
      User
    </span>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error((await res.json()).detail ?? "Failed to load users");
      setUsers(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error loading users");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(user: UserRow) {
    setEditingId(user.id);
    setForm({ username: user.username, email: user.email ?? "", password: "", role: user.role, is_active: user.is_active });
    setFormError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const body: Record<string, unknown> = { role: form.role, is_active: form.is_active };
      if (form.email) body.email = form.email;
      if (form.password) body.password = form.password;

      let res: Response;
      if (editingId === null) {
        if (!form.username.trim()) { setFormError("Username is required"); setSaving(false); return; }
        if (!form.password) { setFormError("Password is required for new users"); setSaving(false); return; }
        res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, username: form.username }),
        });
      } else {
        res = await fetch(`/api/users/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) {
        const data = await res.json();
        setFormError(data.detail ?? "Error saving user");
        return;
      }
      setShowForm(false);
      setSuccess(editingId === null ? "User created successfully" : "User updated successfully");
      setTimeout(() => setSuccess(""), 3000);
      await loadUsers();
    } catch {
      setFormError("Connection error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: UserRow) {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json();
        setError(data.detail ?? "Error deleting user");
        return;
      }
      await loadUsers();
    } catch {
      setError("Connection error");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">Administration</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">Create and manage platform users and roles.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
        >
          <Plus size={16} />
          New user
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 size={16} />
          {success}
        </div>
      )}

      {error && <ErrorState message={error} />}

      {/* Users table */}
      <div className="overflow-hidden rounded-xl border border-line bg-white shadow-soft">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin" /> Loading users…
          </div>
        ) : (
          <>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-slate-50">
                  {["Username", "Email", "Role", "Status", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-ink">{u.username}</td>
                    <td className="px-4 py-3.5 text-slate-500">{u.email ?? "—"}</td>
                    <td className="px-4 py-3.5"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                        u.is_active
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-slate-100 text-slate-500 ring-slate-200"
                      }`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">
                      {new Date(u.created_at).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="rounded-md border border-line bg-white p-1.5 text-slate-500 hover:bg-slate-100 hover:text-ink transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          className="rounded-md border border-line bg-white p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-line bg-slate-50 px-4 py-2.5 text-xs text-slate-400">
              {users.length} user{users.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>

      {/* Modal form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="text-base font-bold text-ink">
                {editingId === null ? "Create user" : "Edit user"}
              </h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4" suppressHydrationWarning>
              {editingId === null && (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Username *</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    placeholder="johndoe"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Password {editingId !== null && <span className="normal-case font-normal text-slate-400">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "admin" | "user" }))}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Status</label>
                  <select
                    value={form.is_active ? "active" : "inactive"}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.value === "active" }))}
                    className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {formError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 border border-red-200">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editingId === null ? "Create" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
