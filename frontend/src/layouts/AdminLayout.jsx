import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { useAuth } from "../hooks/useAuth";

const sidebarItems = [
  { to: "/admin/dashboard", label: "Executive overview", short: "Overview" },
  { to: "/admin/users", label: "Directory & access", short: "Users" },
  { to: "/admin/universities", label: "Institution catalog", short: "Catalog" },
  { to: "/admin/merit-trends", label: "Merit trend manager", short: "Trends" },
  { to: "/admin/chatbot", label: "Chatbot knowledge", short: "Support AI" },
];

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        <aside className="shrink-0 lg:w-56 xl:w-64">
          <div className="lg:sticky lg:top-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Administration</p>
              <h2 className="mt-1 font-heading text-xl font-semibold text-slate-900">Control center</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Manage identities and the institutional dataset surfaced to assessments.
              </p>
              <nav className="mt-5 flex flex-col gap-1" aria-label="Administration">
                {sidebarItems.map((item) => {
                  const active = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                        active ? "bg-blue-600 text-white shadow-soft" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="block">{item.label}</span>
                      <span className={`mt-0.5 block text-[11px] font-normal ${active ? "text-slate-300" : "text-slate-500"}`}>
                        {item.short}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>
        <section className="min-w-0 flex-1">
          <Outlet />
        </section>
      </div>
    </DashboardLayout>
  );
}
