import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50 to-blue-50 p-5 md:p-8">
      <div className="mx-auto max-w-7xl rounded-3xl border border-white/60 bg-white/85 p-6 shadow-soft backdrop-blur md:p-8">
        <header className="mb-8 flex flex-col gap-5 border-b border-slate-200/90 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900 md:text-3xl">Student Dashboard</h1>
            <p className="mt-1 text-sm text-slate-600">
              Welcome back, <span className="font-semibold text-slate-700">{user?.full_name}</span>. Your admission journey is all in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 md:inline-flex">
              {user?.role || "student"}
            </span>
            <Link
              to="/login"
              onClick={logout}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-brand-700"
            >
              Logout
            </Link>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
