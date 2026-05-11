import { useEffect, useMemo, useState } from "react";
import { getAdminUniversities, getAdminUsers } from "../../services/adminService";

function DistributionChart({ title, subtitle, items }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="font-heading text-base font-semibold text-slate-900">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
      <div className="mt-5 space-y-4">
        {items.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-800">{row.label}</span>
              <span className="tabular-nums text-slate-500">{row.value}</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-800 transition-all duration-500"
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
          setError(e?.response?.data?.detail || "Metrics could not be loaded.");
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
        { label: "Tier I institutions", value: tierCounts[1] },
        { label: "Tier II institutions", value: tierCounts[2] },
        { label: "Tier III institutions", value: tierCounts[3] },
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
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-600">Loading operational metrics…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Administration</p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-slate-900 md:text-3xl">Executive overview</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Consolidated view of enrollment into the platform and the health of your institutional catalog.
        </p>
        {error ? <p className="mt-2 text-sm font-medium text-red-600">{error}</p> : null}
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Provisioned accounts",
            value: stats.totalUsers,
            hint: `${stats.students} learners · ${stats.admins} administrators`,
          },
          { label: "Catalog records", value: stats.totalUniversities, hint: "Institutions available to matching" },
          { label: "Open admissions", value: stats.openAdmissions, hint: "Flagged as accepting intake" },
          { label: "Aid-eligible records", value: stats.withScholarships, hint: "Scholarship program indicated" },
        ].map((card) => (
          <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-2 font-heading text-3xl font-semibold tabular-nums text-slate-900">{card.value}</p>
            <p className="mt-1 text-xs text-slate-600">{card.hint}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <DistributionChart
          title="Catalog by tier"
          subtitle="Distribution of catalog entries across institutional tier metadata."
          items={stats.tierRows}
        />
        <DistributionChart title="Catalog by sector" subtitle="Government versus private sector coverage." items={stats.typeRows} />
      </section>

      <section>
        {stats.signupRows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-600">
            No registration timeline yet. Data will populate as accounts are provisioned.
          </div>
        ) : (
          <DistributionChart
            title="New account registrations"
            subtitle="Monthly volume based on account creation timestamps."
            items={stats.signupRows}
          />
        )}
      </section>
    </div>
  );
}
