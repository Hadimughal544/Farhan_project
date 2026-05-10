import { useEffect, useMemo, useState } from "react";
import { getAdminUniversities, getAdminUsers } from "../../services/adminService";

function BarChart({ title, subtitle, items }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      <div className="mt-5 space-y-4">
        {items.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-800">{row.label}</span>
              <span className="text-slate-500">{row.value}</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all"
                style={{ width: `${Math.round((row.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [u, uni] = await Promise.all([getAdminUsers(), getAdminUniversities()]);
        if (!cancelled) {
          setUsers(u);
          setUniversities(uni);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.detail || "Could not load admin metrics.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const students = totalUsers - admins;
    const totalUniversities = universities.length;
    const openAdmissions = universities.filter((u) => u.is_admission_open).length;
    const withScholarships = universities.filter((u) => u.is_scholarships).length;

    const tierCounts = { 1: 0, 2: 0, 3: 0 };
    const typeCounts = { Government: 0, Private: 0 };
    universities.forEach((u) => {
      if (tierCounts[u.tier] !== undefined) tierCounts[u.tier] += 1;
      const t = u.type === "Government" ? "Government" : "Private";
      typeCounts[t] += 1;
    });

    const monthKey = (d) => {
      const dt = new Date(d);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
    };
    const signupsByMonth = {};
    users.forEach((u) => {
      if (!u.created_at) return;
      const key = monthKey(u.created_at);
      signupsByMonth[key] = (signupsByMonth[key] || 0) + 1;
    });
    const signupRows = Object.entries(signupsByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([label, value]) => ({ label, value }));

    return {
      totalUsers,
      admins,
      students,
      totalUniversities,
      openAdmissions,
      withScholarships,
      tierRows: [
        { label: "Tier 1 (High chance fit)", value: tierCounts[1] },
        { label: "Tier 2 (Medium chance fit)", value: tierCounts[2] },
        { label: "Tier 3 (Low chance fit)", value: tierCounts[3] },
      ],
      typeRows: [
        { label: "Government", value: typeCounts.Government },
        { label: "Private", value: typeCounts.Private },
      ],
      signupRows,
    };
  }, [users, universities]);

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-600">Loading dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Platform activity at a glance — user growth, university coverage, and admissions availability.
        </p>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total users", value: stats.totalUsers, hint: `${stats.students} students · ${stats.admins} admins` },
          { label: "Universities", value: stats.totalUniversities, hint: "Catalog size in database" },
          { label: "Open admissions", value: stats.openAdmissions, hint: "Currently accepting applications" },
          { label: "Scholarship programs", value: stats.withScholarships, hint: "Flagged for financial aid" },
        ].map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 font-heading text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-1 text-xs text-slate-600">{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <BarChart
          title="Universities by tier"
          subtitle="Tiers align with model output: High → 1, Medium → 2, Low → 3."
          items={stats.tierRows}
        />
        <BarChart title="Universities by type" subtitle="Government vs private split." items={stats.typeRows} />
      </section>

      <section>
        {stats.signupRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
            No user signup timeline yet — data will appear as users register.
          </div>
        ) : (
          <BarChart
            title="New user signups (by month)"
            subtitle="Based on account created_at timestamps."
            items={stats.signupRows}
          />
        )}
      </section>
    </div>
  );
}
