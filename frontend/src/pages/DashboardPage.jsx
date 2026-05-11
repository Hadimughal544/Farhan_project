import { useMemo } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../hooks/useAuth";

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
    title: "Administration",
    body: "Maintain users, roles, and the institutional catalog used by matching workflows.",
    cta: "Open admin center",
    to: "/admin/dashboard",
    adminOnly: true,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  const joinedLabel = useMemo(() => {
    if (!user?.created_at) return "—";
    return new Date(user.created_at).toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [user?.created_at]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
          <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-6 md:px-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Workspace</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Welcome back{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base">
              Launch an eligibility assessment, review outcomes, and manage your profile from a single, consistent
              workspace.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/predict"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Start eligibility assessment
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              >
                Manage profile
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Quick actions</p>
            <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Key workflows</h2>
            <p className="mt-2 text-sm text-slate-600">
              Member since <span className="font-semibold text-slate-900">{joinedLabel}</span>. Signed in as{" "}
              <span className="font-semibold capitalize text-slate-900">{user?.role}</span>.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {workspaceCards
                .filter((c) => !c.adminOnly || user?.role === "admin")
                .map((c) => (
                  <Link
                    key={c.title}
                    to={c.to}
                    className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-md"
                  >
                    <p className="font-heading text-base font-semibold text-slate-900">{c.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{c.body}</p>
                    <p className="mt-3 text-sm font-semibold text-slate-900 underline-offset-4 group-hover:underline">
                      {c.cta}
                    </p>
                  </Link>
                ))}
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Guidance</p>
            <h2 className="mt-2 font-heading text-xl font-semibold text-slate-900">Recommended next steps</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-slate-900" />
                <span>Run an assessment to refresh your preferred institution suggestion.</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-slate-300" />
                <span>Review your profile details to ensure communication goes to the correct email.</span>
              </li>
              {user?.role === "admin" ? (
                <li className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-slate-300" />
                  <span>Keep the catalog current—program labels must match assessment options.</span>
                </li>
              ) : null}
            </ul>
          </article>
        </section>
      </div>
    </DashboardLayout>
  );
}
