import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { to: "/dashboard", label: "Dashboard", key: "dashboard", icon: "home" },
  { to: "/predict", label: "Eligibility Assessment", key: "predict", icon: "spark" },
  { to: "/student-hub", label: "Student Hub", key: "student", icon: "users" },
  { to: "/scholarships", label: "Scholarships", key: "scholarships", icon: "award" },
  { to: "/career-advisor", label: "Career AI", key: "career", icon: "brief" },
  { to: "/roadmap", label: "Roadmap", key: "roadmap", icon: "route" },
  { to: "/compare", label: "Compare", key: "compare", icon: "compare" },
  { to: "/settings", label: "Settings", key: "settings", icon: "settings" },
  { to: "/profile", label: "Profile", key: "profile", icon: "profile" },
];

function SidebarIcon({ name, className = "h-4 w-4" }) {
  if (name === "home") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" />
      </svg>
    );
  }
  if (name === "spark") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 9 10l-6 2 6 2 3 7 3-7 6-2-6-2-3-7Z" />
      </svg>
    );
  }
  if (name === "users") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }
  if (name === "award") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="8" r="5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m8 14-1 7 5-3 5 3-1-7" />
      </svg>
    );
  }
  if (name === "brief") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    );
  }
  if (name === "route") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h4a4 4 0 0 1 4 4v4" />
      </svg>
    );
  }
  if (name === "compare") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      </svg>
    );
  }
  if (name === "settings") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.4 15 1.1 1.9-1.9 3.3-2.2-.3a7.3 7.3 0 0 1-1.6.9l-.7 2.1H10l-.7-2.1a7.3 7.3 0 0 1-1.6-.9l-2.2.3-1.9-3.3L4.7 15a7.2 7.2 0 0 1 0-1.9L3.6 11l1.9-3.3 2.2.3c.5-.4 1-.6 1.6-.9L10 5h4l.7 2.1c.6.3 1.1.5 1.6.9l2.2-.3 1.9 3.3-1.1 2.1c.1.6.1 1.3 0 1.9Z" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="8" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function getInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "U";
  const a = parts[0]?.[0] || "U";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return `${a}${b}`.toUpperCase();
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = useMemo(
    () => (user?.role === "admin" ? [...navItems, { to: "/admin/dashboard", label: "Admin", key: "admin", icon: "brief" }] : navItems),
    [user?.role]
  );

  const closeMenu = () => setMenuOpen(false);
  const isActive = (path) => location.pathname === path || (path === "/admin/dashboard" && location.pathname.startsWith("/admin"));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative h-screen overflow-hidden bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] px-4 py-4 lg:block">
        <div className="flex h-full flex-col rounded-3xl border border-slate-700/70 bg-slate-900/95 p-4 shadow-2xl">
          <Link to="/dashboard" className="flex items-center gap-3 rounded-2xl px-3 py-2 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-xs font-bold">FC</span>
            <div>
              <p className="font-heading text-lg font-semibold leading-tight">FutureCampus</p>
              <p className="text-xs text-slate-300">Admissions Intelligence</p>
            </div>
          </Link>

          <nav className="mt-5 flex flex-1 flex-col gap-1" aria-label="Primary">
            {nav.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/30"
                      : "text-slate-200 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <SidebarIcon name={item.icon} className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-3">
            <div className="flex items-center gap-3">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-700 text-xs font-bold text-white">
                  {getInitials(user?.full_name)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{user?.full_name || "User"}</p>
                <p className="truncate text-xs text-slate-300">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-xl border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {menuOpen ? (
        <>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-[1px] lg:hidden"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[320px] px-3 py-3 lg:hidden">
            <div className="flex h-full flex-col rounded-3xl border border-slate-700/70 bg-slate-900 p-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-heading text-lg font-semibold text-white">Navigation</p>
                <button type="button" onClick={closeMenu} className="rounded-lg p-2 text-slate-200 hover:bg-slate-800">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
                {nav.map((item) => {
                  const active = isActive(item.to);
                  return (
                    <Link
                      key={item.key}
                      to={item.to}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all ${
                        active ? "bg-blue-600 text-white" : "text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <SidebarIcon name={item.icon} className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 w-full rounded-xl border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          </aside>
        </>
      ) : null}

      <main className="h-screen overflow-y-auto lg:pl-[296px]">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700"
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <p className="font-heading text-base font-semibold text-slate-900">FutureCampus</p>
          <span className="h-9 w-9" />
        </div>

        <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6 lg:px-8 lg:py-8">
          <div className="page-enter">{children}</div>
          <footer className="mt-8 border-t border-slate-200 pt-5 text-xs text-slate-500">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>© {new Date().getFullYear()} FutureCampus</span>
              <span>Production-ready admissions intelligence workspace</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
