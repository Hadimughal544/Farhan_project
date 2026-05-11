import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getScholarshipRecommendations } from "../services/advancedService";

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export default function ScholarshipsPage() {
  const [form, setForm] = useState({ marks: "", income_range: "", city: "", degree_preference: "Computer Science" });
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await getScholarshipRecommendations({ ...form, marks: Number(form.marks) });
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not fetch recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Financial intelligence</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-slate-900 md:text-3xl">Scholarship Recommendation System</h1>
        </header>

        <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <input className={fieldClass} placeholder="Marks (%)" value={form.marks} onChange={(e) => setForm((p) => ({ ...p, marks: e.target.value }))} type="number" min="0" max="100" required />
            <input className={fieldClass} placeholder="Income range (e.g. below 50000)" value={form.income_range} onChange={(e) => setForm((p) => ({ ...p, income_range: e.target.value }))} required />
            <input className={fieldClass} placeholder="City" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} required />
            <input className={fieldClass} placeholder="Degree preference" value={form.degree_preference} onChange={(e) => setForm((p) => ({ ...p, degree_preference: e.target.value }))} required />
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" disabled={loading}>
            {loading ? "Analyzing..." : "Recommend Scholarships"}
          </button>
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </form>

        <section className="grid gap-3 md:grid-cols-2">
          {result.map((item) => (
            <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-slate-500">{item.category}</p>
              <h3 className="mt-1 font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.reason}</p>
            </article>
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}
