import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { deleteAdminUser, getAdminUsers, updateAdminUserRole } from "../../services/adminService";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
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
      setError(e?.response?.data?.detail || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRoleChange = async (id, role) => {
    setStatus("");
    setError("");
    try {
      await updateAdminUserRole(id, role);
      setStatus("User role updated.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to update role.");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    setStatus("");
    setError("");
    try {
      await deleteAdminUser(id);
      setStatus("User deleted.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.detail || "Failed to delete user.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-600">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">User management</h1>
        <p className="mt-1 text-sm text-slate-600">View accounts, adjust roles, and remove inactive users.</p>
        {status ? <p className="mt-2 text-sm text-emerald-700">{status}</p> : null}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Email</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Role</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Joined</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.full_name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-2">
                      <select
                        value={u.role}
                        onChange={(e) => onRoleChange(u.id, e.target.value)}
                        disabled={u.id === user?.id}
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-50"
                      >
                        <option value="student">student</option>
                        <option value="admin">admin</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => onDelete(u.id)}
                        disabled={u.id === user?.id}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
