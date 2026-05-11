import { useEffect, useState } from "react";
import { createMeritTrend, deleteMeritTrend, getMeritTrends } from "../../services/advancedService";
import { getAdminUniversities } from "../../services/adminService";

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export default function AdminMeritTrendsPage() {
  const [universities, setUniversities] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ university_id: "", year: "", opening_merit: "", closing_merit: "" });
  const [error, setError] = useState("");

  const load = async () => {
    const [trendData, unis] = await Promise.all([getMeritTrends(), getAdminUniversities()]);
    setRows(trendData || []);
    setUniversities(unis || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createMeritTrend({
        university_id: Number(form.university_id),
        year: Number(form.year),
        opening_merit: Number(form.opening_merit),
        closing_merit: Number(form.closing_merit),
      });
      setForm({ university_id: "", year: "", opening_merit: "", closing_merit: "" });
      await load();
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not create trend.");
    }
  };

  const remove = async (id) => {
    await deleteMeritTrend(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Administration</p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-slate-900">Merit Trend Management</h1>
      </header>

      <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="grid gap-3 md:grid-cols-4">
          <select className={fieldClass} value={form.university_id} onChange={(e) => setForm((p) => ({ ...p, university_id: e.target.value }))} required>
            <option value="">Select university</option>
            {universities.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <input className={fieldClass} type="number" placeholder="Year" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} required />
          <input className={fieldClass} type="number" placeholder="Opening merit" value={form.opening_merit} onChange={(e) => setForm((p) => ({ ...p, opening_merit: e.target.value }))} required />
          <input className={fieldClass} type="number" placeholder="Closing merit" value={form.closing_merit} onChange={(e) => setForm((p) => ({ ...p, closing_merit: e.target.value }))} required />
        </div>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Add Trend</button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">University</th>
              <th className="px-3 py-2 text-left">Year</th>
              <th className="px-3 py-2 text-left">Opening</th>
              <th className="px-3 py-2 text-left">Closing</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{row.university_name}</td>
                <td className="px-3 py-2">{row.year}</td>
                <td className="px-3 py-2">{row.opening_merit}</td>
                <td className="px-3 py-2">{row.closing_merit}</td>
                <td className="px-3 py-2 text-right">
                  <button type="button" onClick={() => remove(row.id)} className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
