import DashboardLayout from "../layouts/DashboardLayout";
import { Link } from "react-router-dom";

export default function LandingAfterLogin() {
  return (
    <DashboardLayout>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Welcome</p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Your admissions workspace
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-base">
            Run a structured eligibility assessment, review your composite readiness, and receive a single suggested
            institution from your organization&apos;s catalog.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/predict"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Start eligibility assessment
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Open workspace
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card md:p-8">
          <h2 className="font-heading text-lg font-semibold text-slate-900">How it works</h2>
          <ol className="mt-5 space-y-4 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                1
              </span>
              <span>Complete the guided questionnaire—academic record, program intent, budget, and sector preferences.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-800">
                2
              </span>
              <span>Generate an assessment to compute your composite readiness index from the supplied inputs.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-800">
                3
              </span>
              <span>Review your outcome summary and the preferred institution selected from the catalog.</span>
            </li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  );
}
