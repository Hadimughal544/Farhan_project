import { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { generateRoadmap } from "../services/advancedService";

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200";

export default function RoadmapPage() {
  const [degree, setDegree] = useState("Cyber Security");
  const [semester, setSemester] = useState(3);
  const [roadmap, setRoadmap] = useState(null);

  const onGenerate = async (e) => {
    e.preventDefault();
    const data = await generateRoadmap({ degree, current_semester: Number(semester) });
    setRoadmap(data);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">AI planning</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-slate-900 md:text-3xl">AI Roadmap Generator</h1>
        </header>

        <form onSubmit={onGenerate} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <input className={fieldClass} value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="Degree" />
            <input className={fieldClass} value={semester} onChange={(e) => setSemester(e.target.value)} type="number" min="1" max="8" />
          </div>
          <button type="submit" className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Generate Roadmap
          </button>
        </form>

        {roadmap ? (
          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold text-slate-900">Semester roadmap</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                {roadmap.semester_roadmap.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold text-slate-900">Skills and certifications</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                {[...roadmap.skills_roadmap, ...roadmap.certifications].map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </article>
          </section>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
