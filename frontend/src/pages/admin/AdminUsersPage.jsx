import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { deleteAdminUser, getAdminUsers, sendAdminUsersEmail, updateAdminUserRole } from "../../services/adminService";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailForm, setEmailForm] = useState({
    send_to: "all",
    subject: "",
    body: "",
  });

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

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => filtered.some((u) => u.id === id)));
  }, [filtered]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((u) => selectedSet.has(u.id));

  const toggleSelect = (userId) => {
    setSelectedIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const filteredSet = new Set(filtered.map((u) => u.id));
      setSelectedIds((prev) => prev.filter((id) => !filteredSet.has(id)));
      return;
    }
    const next = new Set(selectedIds);
    filtered.forEach((u) => next.add(u.id));
    setSelectedIds(Array.from(next));
  };

  const onEmailFormChange = (e) => {
    const { name, value } = e.target;
    setEmailForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSendEmail = async (e) => {
    e.preventDefault();
    setStatus("");
    setError("");

    if (!emailForm.subject.trim() || !emailForm.body.trim()) {
      setError("Subject and email body are required.");
      return;
    }
    if (emailForm.send_to === "selected" && selectedIds.length === 0) {
      setError("Select at least one user for selected send mode.");
      return;
    }

    setSendingEmail(true);
    try {
      const payload = {
        send_to: emailForm.send_to,
        user_ids: emailForm.send_to === "selected" ? selectedIds : [],
        subject: emailForm.subject.trim(),
        body: emailForm.body.trim(),
      };
      const res = await sendAdminUsersEmail(payload);
      setStatus(`Email sent to ${res.recipients} users${res.skipped_users ? ` (${res.skipped_users} skipped)` : ""}.`);
      setEmailForm((prev) => ({ ...prev, subject: "", body: "" }));
    } catch (e2) {
      setError(e2?.response?.data?.detail || "Bulk email send failed.");
    } finally {
      setSendingEmail(false);
    }
  };

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
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Bulk communication</p>
            <h2 className="mt-1 font-heading text-xl font-semibold text-slate-900">Email users from admin panel</h2>
            <p className="mt-1 text-sm text-slate-600">
              Send one email to all users or only selected users from the table below.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Selected users: <span className="font-semibold text-slate-900">{selectedIds.length}</span>
          </div>
        </div>

        <form onSubmit={onSendEmail} className="mt-4 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="send_to" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Recipients
              </label>
              <select
                id="send_to"
                name="send_to"
                value={emailForm.send_to}
                onChange={onEmailFormChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="all">All users</option>
                <option value="selected">Selected users</option>
              </select>
            </div>
            <div>
              <label htmlFor="subject" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Subject
              </label>
              <input
                id="subject"
                name="subject"
                value={emailForm.subject}
                onChange={onEmailFormChange}
                placeholder="e.g. Important admission deadline update"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div>
            <label htmlFor="body" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email body
            </label>
            <textarea
              id="body"
              name="body"
              rows={5}
              value={emailForm.body}
              onChange={onEmailFormChange}
              placeholder="Write your message here..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sendingEmail}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sendingEmail ? "Sending..." : "Send email"}
            </button>
          </div>
        </form>
      </section>

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
                <th className="px-4 py-3 font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAllFiltered}
                    aria-label="Select all filtered users"
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                  />
                </th>
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
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No records match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedSet.has(u.id)}
                        onChange={() => toggleSelect(u.id)}
                        aria-label={`Select ${u.full_name}`}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                      />
                    </td>
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
