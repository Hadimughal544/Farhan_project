import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <header className="w-full border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <Link to="/dashboard" className="text-lg font-bold text-slate-900">
              Admission Advisor
            </Link>
            <p className="text-xs text-slate-500">Welcome, {user?.full_name}</p>
          </div>

          <nav className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className={`px-3 py-2 text-sm font-medium ${isActive("/dashboard") ? "text-brand-700" : "text-slate-600"}`}
            >
              Dashboard
            </Link>
            <Link to="/predict" className={`px-3 py-2 text-sm font-medium ${isActive("/predict") ? "text-brand-700" : "text-slate-600"}`}>
              Prediction
            </Link>
            {user?.role === "admin" ? (
              <Link
                to="/admin/dashboard"
                className={`px-3 py-2 text-sm font-medium ${location.pathname.startsWith("/admin") ? "text-brand-700" : "text-slate-600"}`}
              >
                Admin
              </Link>
            ) : null}

            <button onClick={logout} className="ml-4 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
      </main>

      <footer className="w-full border-t bg-white/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 text-sm text-slate-600">
          <div>© {new Date().getFullYear()} Admission Advisor — Built for Pakistan universities</div>
          <div>Support · Privacy · Terms</div>
        </div>
      </footer>
    </div>
  );
}
