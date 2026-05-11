import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { compareUniversities } from "../services/advancedService";
import { getDashboardUniversities } from "../services/dashboardService";

export default function UniversityComparisonPage() {
  const [universities, setUniversities] = useState([]);
  const [selected, setSelected] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const data = await getDashboardUniversities();
      setUniversities(data || []);
    })();
  }, []);

  const toggle = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const runComparison = async () => {
    setError("");
    try {
      const data = await compareUniversities(selected);
      setComparison(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not compare universities.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Decision support</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-slate-900 md:text-3xl">University Comparison Tool</h1>
          <p className="mt-2 text-sm text-slate-600">Select up to 3 universities for side-by-side comparison.</p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {universities.map((uni) => (
              <label key={uni.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                <input type="checkbox" checked={selected.includes(uni.id)} onChange={() => toggle(uni.id)} />
                <span>{uni.name}</span>
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={runComparison}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            disabled={selected.length < 2}
          >
            Compare Selected
          </button>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        </section>

        {comparison.length > 0 ? (
          <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">Feature</th>
                  {comparison.map((u) => (
                    <th key={u.id} className="px-3 py-2 text-left">{u.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["merit", "type", "tier", "min_fee", "max_fee", "is_scholarships", "is_admission_open"].map((feature) => (
                  <tr key={feature} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-700">{feature.replaceAll("_", " ")}</td>
                    {comparison.map((u) => (
                      <td key={`${u.id}_${feature}`} className="px-3 py-2 text-slate-600">{String(u[feature])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
