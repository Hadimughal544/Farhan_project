import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { deleteAdminUser, getAdminUsers, updateAdminUserRole } from "../../services/adminService";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (e) {
      setError(e?.response?.data?.detail || "Directory could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q)
    );
  }, [users, query]);

  const onRoleChange = async (id, role) => {
    setStatus("");
    setError("");
    try {
      await updateAdminUserRole(id, role);
      setStatus("Role assignment updated.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || "Role update failed.");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Permanently remove this account? This cannot be undone.")) return;
    setStatus("");
    setError("");
    try {
      await deleteAdminUser(id);
      setStatus("Account removed.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || "Deletion failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-600">Loading directory…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Administration</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-slate-900">Directory & access</h1>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Search the user directory, adjust role assignments, and retire accounts that are no longer required.
          </p>
          {status ? <p className="mt-2 text-sm font-medium text-emerald-700">{status}</p> : null}
          {error ? <p className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}
        </div>
        <div className="w-full sm:max-w-xs">
          <label htmlFor="user-search" className="sr-only">
            Search users
          </label>
          <input
            id="user-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, role…"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3 text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{filtered.length}</span> of {users.length} records
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/90">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Role</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Joined</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    No records match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-900">{u.full_name}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold capitalize text-slate-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 tabular-nums">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-2">
                        <select
                          value={u.role}
                          onChange={(e) => onRoleChange(u.id, e.target.value)}
                          disabled={u.id === user?.id}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <option value="student">Learner</option>
                          <option value="admin">Administrator</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => onDelete(u.id)}
                          disabled={u.id === user?.id}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
