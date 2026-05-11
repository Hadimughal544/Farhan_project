import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { getCareerRecommendation } from "../services/advancedService";

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export default function CareerAdvisorPage() {
  const [form, setForm] = useState({ ai: 5, cyber_security: 5, software_engineering: 5, data_science: 5, python: 5, networking: 5, personality: "balanced" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await getCareerRecommendation({
        interests: {
          ai: Number(form.ai),
          "cyber security": Number(form.cyber_security),
          "software engineering": Number(form.software_engineering),
          "data science": Number(form.data_science),
        },
        skills: {
          python: Number(form.python),
          networking: Number(form.networking),
          "problem solving": 7,
        },
        personality: form.personality,
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const slider = (name, label) => (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <input
        type="range"
        min="0"
        max="10"
        value={form[name]}
        onChange={(e) => setForm((p) => ({ ...p, [name]: e.target.value }))}
        className="w-full"
      />
      <p className="text-xs text-slate-500">Score: {form[name]}/10</p>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">AI counselor</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-slate-900 md:text-3xl">Degree / Career Recommendation</h1>
        </header>

        <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {slider("ai", "Interest in AI")}
            {slider("cyber_security", "Interest in Cyber Security")}
            {slider("software_engineering", "Interest in Software Engineering")}
            {slider("data_science", "Interest in Data Science")}
            {slider("python", "Skill in Python")}
            {slider("networking", "Skill in Networking")}
          </div>
          <input
            className={fieldClass}
            placeholder="Personality (e.g. analytical, creative)"
            value={form.personality}
            onChange={(e) => setForm((p) => ({ ...p, personality: e.target.value }))}
          />
          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white" disabled={loading}>
            {loading ? "Analyzing..." : "Get Career Recommendation"}
          </button>
        </form>

        {result ? (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-heading text-xl font-semibold text-slate-900">Recommended Degree: {result.best_degree}</h2>
            <p className="mt-2 text-sm text-slate-600">{result.future_scope}</p>
            <p className="mt-2 text-sm text-slate-700">Expected salary: {result.expected_salary_pkr}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.required_skills.map((skill) => (
                <span key={skill} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
