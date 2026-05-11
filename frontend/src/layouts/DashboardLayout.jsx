import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import UserMenu from "../components/UserMenu";

const navLinkClass = (active) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const adminActive = location.pathname.startsWith("/admin");

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2.5" onClick={closeMenu}>
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                FC
              </span>
              <div className="leading-tight">
                <span className="font-heading text-base font-semibold text-slate-900">FutureCampus</span>
                <p className="hidden text-[11px] font-medium text-slate-500 sm:block">Admissions intelligence</p>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            <Link to="/dashboard" className={navLinkClass(isActive("/dashboard"))}>
              Workspace
            </Link>
            <Link to="/predict" className={navLinkClass(isActive("/predict"))}>
              Eligibility assessment
            </Link>
            {user?.role === "admin" ? (
              <Link to="/admin/dashboard" className={navLinkClass(adminActive)}>
                Administration
              </Link>
            ) : null}
            <div className="ml-2">
              <UserMenu />
            </div>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="rounded-lg border border-slate-200 p-2 text-slate-800"
              aria-expanded={menuOpen}
              aria-label="Open menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
            <p className="mb-2 text-xs font-medium text-slate-500">{user?.full_name}</p>
            <div className="flex flex-col gap-1">
              <Link to="/dashboard" className={navLinkClass(isActive("/dashboard"))} onClick={closeMenu}>
                Workspace
              </Link>
              <Link to="/predict" className={navLinkClass(isActive("/predict"))} onClick={closeMenu}>
                Eligibility assessment
              </Link>
              {user?.role === "admin" ? (
                <Link to="/admin/dashboard" className={navLinkClass(adminActive)} onClick={closeMenu}>
                  Administration
                </Link>
              ) : null}
              <Link to="/profile" className={navLinkClass(isActive("/profile"))} onClick={closeMenu}>
                Profile
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-10">{children}</div>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <span>© {new Date().getFullYear()} FutureCampus. Institutional guidance for Pakistan.</span>
          <span className="text-slate-400">Enterprise use · Data handled per your organization policy</span>
        </div>
      </footer>
    </div>
  );
}
