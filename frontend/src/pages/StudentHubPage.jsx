import { useEffect, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getPredictionHistory, getSavedUniversities, getStudentDashboard, removeSavedUniversity } from "../services/advancedService";

export default function StudentHubPage() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [dashboard, predictionHistory, savedUniversities] = await Promise.all([
        getStudentDashboard(),
        getPredictionHistory(),
        getSavedUniversities(),
      ]);
      setSummary(dashboard);
      setHistory(predictionHistory);
      setSaved(savedUniversities);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not load student dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRemoveSaved = async (id) => {
    await removeSavedUniversity(id);
    await load();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Personalized workspace</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-slate-900 md:text-3xl">Student Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Track saved universities, prediction history, scholarships, and deadlines.</p>
        </header>

        {loading ? <p className="text-sm text-slate-600">Loading dashboard...</p> : null}
        {error ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        {summary ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Saved universities</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.saved_universities}</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Prediction history</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{summary.prediction_history}</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-2 xl:col-span-1">
              <p className="text-xs text-slate-500">Scholarship status</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{summary.scholarship_status}</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">Upcoming deadlines</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {(summary.application_deadlines || []).slice(0, 2).map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </article>
          </section>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-heading text-lg font-semibold text-slate-900">Saved Universities</h2>
            <div className="mt-3 space-y-2">
              {saved.length === 0 ? <p className="text-sm text-slate-500">No universities saved yet.</p> : null}
              {saved.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-900">{item.university_name}</p>
                    <p className="text-xs text-slate-500">{item.note || "No note"}</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700"
                    onClick={() => onRemoveSaved(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-heading text-lg font-semibold text-slate-900">Recent Predictions</h2>
            <div className="mt-3 space-y-2">
              {history.length === 0 ? <p className="text-sm text-slate-500">No prediction history yet.</p> : null}
              {history.slice(0, 8).map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 px-3 py-2">
                  <p className="font-medium text-slate-900">{item.prediction_label}</p>
                  <p className="text-xs text-slate-500">
                    Chance {item.chance_percent}% · {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </DashboardLayout>
  );
}
