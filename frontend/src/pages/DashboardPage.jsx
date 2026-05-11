import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../hooks/useAuth";
import { getDashboardUniversities } from "../services/dashboardService";

const workspaceCards = [
  {
    title: "Eligibility assessment",
    body: "Run a guided intake to generate an outcome summary and a preferred institution from your catalog.",
    cta: "Start assessment",
    to: "/predict",
  },
  {
    title: "Profile management",
    body: "Update your name and email used across the platform for audit and administrative references.",
    cta: "Open profile",
    to: "/profile",
  },
  {
    title: "Scholarship advisor",
    body: "Discover merit, need-based, government, and university aid opportunities for your profile.",
    cta: "Find scholarships",
    to: "/scholarships",
  },
  {
    title: "University comparison",
    body: "Compare fees, merit thresholds, tiers, and aid flags side-by-side before applying.",
    cta: "Compare universities",
    to: "/compare",
  },
  {
    title: "Career & roadmap AI",
    body: "Get degree recommendations and a semester-wise roadmap with skills and certification guidance.",
    cta: "Open AI advisor",
    to: "/career-advisor",
  },
  {
    title: "Administration",
    body: "Maintain users, roles, and the institutional catalog used by matching workflows.",
    cta: "Open admin center",
    to: "/admin/dashboard",
    adminOnly: true,
  },
];

const BUDGET_BUCKETS = [
  { key: "low", label: "Low budget", min: 0, max: 500000 },
  { key: "medium", label: "Medium budget", min: 500001, max: 1200000 },
  { key: "high", label: "High budget", min: 1200001, max: Number.POSITIVE_INFINITY },
];

function toPct(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function metricRowsFromCountMap(countMap, total) {
  return Object.entries(countMap).map(([label, count]) => ({
    label,
    count,
    percent: toPct(count, total),
  }));
}

function MetricsTable({ title, rows }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-3 rounded-t-2xl">
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</h3>
      </div>
      <div className="overflow-hidden rounded-b-2xl">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-5 py-3 text-left font-semibold text-slate-600">Category</th>
              <th className="px-5 py-3 text-right font-semibold text-slate-600">Count</th>
              <th className="px-5 py-3 text-right font-semibold text-slate-600">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row, idx) => (
              <tr key={row.label} className="transition-colors hover:bg-slate-50/80">
                <td className="px-5 py-3 font-medium text-slate-700">{row.label}</td>
                <td className="px-5 py-3 text-right font-bold text-slate-900">{row.count}</td>
                <td className="px-5 py-3 text-right text-slate-600">{row.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [universities, setUniversities] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  const joinedLabel = useMemo(() => {
    if (!user?.created_at) return "—";
    return new Date(user.created_at).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [user?.created_at]);

  useEffect(() => {
    let mounted = true;

    const loadUniversities = async () => {
      setLoadingAnalytics(true);
      setAnalyticsError("");
      try {
        const data = await getDashboardUniversities();
        if (!mounted) return;
        setUniversities(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!mounted) return;
        setAnalyticsError(err?.response?.data?.detail || "Could not load university analytics.");
      } finally {
        if (mounted) setLoadingAnalytics(false);
      }
    };

    loadUniversities();
    return () => {
      mounted = false;
    };
  }, []);

  const analytics = useMemo(() => {
    const total = universities.length;

    const admission = { Open: 0, Closed: 0 };
    const scholarships = { Available: 0, "Not available": 0 };
    const types = { Private: 0, Government: 0, Other: 0 };
    const tiers = { "Tier 1": 0, "Tier 2": 0, "Tier 3": 0, Other: 0 };
    const budget = { "Low budget": 0, "Medium budget": 0, "High budget": 0 };

    for (const uni of universities) {
      if (uni?.is_admission_open) admission.Open += 1;
      else admission.Closed += 1;

      if (uni?.is_scholarships) scholarships.Available += 1;
      else scholarships["Not available"] += 1;

      const normalizedType = String(uni?.type ?? "").trim().toLowerCase();
      if (normalizedType === "private") types.Private += 1;
      else if (normalizedType === "government") types.Government += 1;
      else types.Other += 1;

      if (uni?.tier === 1) tiers["Tier 1"] += 1;
      else if (uni?.tier === 2) tiers["Tier 2"] += 1;
      else if (uni?.tier === 3) tiers["Tier 3"] += 1;
      else tiers.Other += 1;

      const minFee = Number(uni?.min_fee ?? 0);
      const maxFee = Number(uni?.max_fee ?? minFee);
      const averageFee = (minFee + maxFee) / 2;

      const matchedBucket = BUDGET_BUCKETS.find((bucket) => averageFee >= bucket.min && averageFee <= bucket.max);
      if (matchedBucket?.key === "low") budget["Low budget"] += 1;
      if (matchedBucket?.key === "medium") budget["Medium budget"] += 1;
      if (matchedBucket?.key === "high") budget["High budget"] += 1;
    }

    const admissionRows = metricRowsFromCountMap(admission, total);
    const scholarshipRows = metricRowsFromCountMap(scholarships, total);
    const budgetRows = metricRowsFromCountMap(budget, total);
    const typeRows = metricRowsFromCountMap(types, total);
    const tierRows = metricRowsFromCountMap(tiers, total);

    return {
      total,
      admissionRows,
      scholarshipRows,
      budgetRows,
      typeRows,
      tierRows,
      admissionPieData: admissionRows.map((row) => ({ name: row.label, value: row.count })),
      scholarshipPieData: scholarshipRows.map((row) => ({ name: row.label, value: row.count })),
      budgetBarData: budgetRows.map((row) => ({
        name: row.label,
        count: row.count,
        share: row.percent,
      })),
      typeBarData: typeRows.map((row) => ({
        name: row.label,
        count: row.count,
      })),
      tierLineData: tierRows.map((row) => ({
        name: row.label,
        universities: row.count,
      })),
    };
  }, [universities]);

  const admissionColors = ["#10b981", "#64748b"];
  const scholarshipColors = ["#3b82f6", "#94a3b8"];

  return (
    <DashboardLayout>
      <div className="space-y-8 bg-gradient-to-br from-slate-50 via-white to-slate-50/30">
        {/* Enhanced Hero Section */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-100">
          <div className="relative px-8 py-10 md:px-10">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/30" />
            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Workspace</p>
              <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
                Launch an eligibility assessment, review outcomes, and manage your profile from a single, consistent
                workspace.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/predict"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
                >
                  Start eligibility assessment
                </Link>
                <Link
                  to="/profile"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-95"
                >
                  Manage profile
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Dashboard Section */}
        <section className="rounded-2xl bg-white shadow-xl ring-1 ring-slate-100">
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white px-8 py-6 rounded-t-2xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">University intelligence</p>
                <h2 className="mt-2 font-heading text-3xl font-bold text-slate-900">Analytics dashboard</h2>
                <p className="mt-1 text-slate-600">Live charts for admissions, scholarships, budget bands, sector types, and tier distribution.</p>
              </div>
              <div className="rounded-full bg-indigo-50 px-5 py-2 text-sm font-medium text-indigo-800 shadow-inner">
                Total universities: <span className="font-bold text-indigo-900">{analytics.total}</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {loadingAnalytics ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                <span className="ml-3 text-slate-600">Loading university analytics...</span>
              </div>
            ) : analyticsError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 px-5 py-4 text-rose-700 backdrop-blur-sm">
                {analyticsError}
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/30 p-5 shadow-sm transition-all hover:shadow-md">
                    <h3 className="font-heading text-lg font-semibold text-slate-800">Admissions overview</h3>
                    <div className="mt-2 h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.admissionPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={4}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {analytics.admissionPieData.map((entry, idx) => (
                              <Cell key={entry.name} fill={admissionColors[idx % admissionColors.length]} stroke="white" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/30 p-5 shadow-sm transition-all hover:shadow-md">
                    <h3 className="font-heading text-lg font-semibold text-slate-800">Scholarship availability</h3>
                    <div className="mt-2 h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={analytics.scholarshipPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={4}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {analytics.scholarshipPieData.map((entry, idx) => (
                              <Cell key={entry.name} fill={scholarshipColors[idx % scholarshipColors.length]} stroke="white" strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/30 p-5 shadow-sm transition-all hover:shadow-md">
                    <h3 className="font-heading text-lg font-semibold text-slate-800">Budget distribution</h3>
                    <div className="mt-2 h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.budgetBarData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Legend />
                          <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} name="Universities" barSize={48} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/30 p-5 shadow-sm transition-all hover:shadow-md">
                    <h3 className="font-heading text-lg font-semibold text-slate-800">Tier distribution trend</h3>
                    <div className="mt-2 h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.tierLineData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="universities"
                            stroke="#0f172a"
                            strokeWidth={3}
                            dot={{ r: 6, strokeWidth: 2, stroke: '#0f172a', fill: 'white' }}
                            activeDot={{ r: 8 }}
                            name="Universities"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/30 p-5 shadow-sm transition-all hover:shadow-md">
                    <h3 className="font-heading text-lg font-semibold text-slate-800">University type breakdown</h3>
                    <div className="mt-2 h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.typeBarData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Legend />
                          <Bar dataKey="count" fill="#0284c7" radius={[8, 8, 0, 0]} name="Universities" barSize={48} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50/30 p-5 shadow-sm transition-all hover:shadow-md">
                    <h3 className="font-heading text-lg font-semibold text-slate-800">Key metrics snapshot</h3>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {analytics.admissionRows.concat(analytics.scholarshipRows).map((row) => (
                        <div key={row.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm transition-all hover:shadow">
                          <span className="text-sm font-semibold text-slate-700">{row.label}</span>
                          <span className="text-lg font-bold text-slate-900">{row.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <MetricsTable title="Type-wise universities" rows={analytics.typeRows} />
                  <MetricsTable title="Tier-wise universities" rows={analytics.tierRows} />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions and Guidance Section */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white shadow-xl ring-1 ring-slate-100 md:col-span-2">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white px-7 py-5 rounded-t-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Quick actions</p>
              <h2 className="mt-1 font-heading text-2xl font-bold text-slate-900">Key workflows</h2>
              <p className="mt-1 text-sm text-slate-600">
                Member since <span className="font-semibold text-slate-900">{joinedLabel}</span>. Signed in as{" "}
                <span className="font-semibold capitalize text-indigo-800">{user?.role}</span>.
              </p>
            </div>
            <div className="p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                {workspaceCards
                  .filter((c) => !c.adminOnly || user?.role === "admin")
                  .map((c) => (
                    <Link
                      key={c.title}
                      to={c.to}
                      className="group rounded-xl border border-slate-100 bg-white p-5 transition-all hover:border-slate-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <p className="font-heading text-base font-bold text-slate-900">{c.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.body}</p>
                      <p className="mt-4 text-sm font-semibold text-indigo-600 underline-offset-4 group-hover:underline">
                        {c.cta} →
                      </p>
                    </Link>
                  ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/30 shadow-xl ring-1 ring-slate-100">
            <div className="p-7">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Guidance</p>
              <h2 className="mt-1 font-heading text-2xl font-bold text-slate-900">Recommended next steps</h2>
              <ul className="mt-5 space-y-4">
                <li className="flex gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm transition-all hover:bg-white">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-indigo-200" />
                  <span className="text-sm text-slate-700">Run an assessment to refresh your preferred institution suggestion.</span>
                </li>
                <li className="flex gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm transition-all hover:bg-white">
                  <span className="mt-1 h-2 w-2 rounded-full bg-slate-400 ring-2 ring-slate-200" />
                  <span className="text-sm text-slate-700">Review your profile details to ensure communication goes to the correct email.</span>
                </li>
                {user?.role === "admin" ? (
                  <li className="flex gap-3 rounded-lg bg-white/60 p-3 backdrop-blur-sm transition-all hover:bg-white">
                    <span className="mt-1 h-2 w-2 rounded-full bg-slate-400 ring-2 ring-slate-200" />
                    <span className="text-sm text-slate-700">Keep the catalog current—program labels must match assessment options.</span>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}