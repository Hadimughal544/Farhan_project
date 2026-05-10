import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { useAuth } from "../hooks/useAuth";

const sidebarItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/universities", label: "Universities" },
];

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Admin Center</h2>
            <p className="mt-1 text-sm text-slate-600">Manage system operations from one place.</p>
            <nav className="mt-4 space-y-2">
              {sidebarItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-brand-600 text-white"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <section className="lg:col-span-9">
          <Outlet />
        </section>
      </div>
    </DashboardLayout>
  );
}
