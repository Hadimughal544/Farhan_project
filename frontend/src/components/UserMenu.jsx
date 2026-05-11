import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "U";
  const first = parts[0]?.[0] || "U";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
}

export default function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const joined = useMemo(() => {
    if (!user?.created_at) return null;
    return new Date(user.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  }, [user?.created_at]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onSignOut = () => {
    logout();
    toast.success("Signed out successfully.");
    navigate("/login");
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt="avatar" className="h-8 w-8 rounded-lg object-cover" />
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-[11px] font-bold text-white">
            {initials(user?.full_name)}
          </span>
        )}
        <span className="hidden max-w-[160px] truncate sm:block">{user?.full_name || "User"}</span>
        <svg className={`h-4 w-4 text-slate-500 transition ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div
          className="absolute right-0 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lift animate-slide-up"
          role="menu"
        >
          <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Signed in</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{user?.email}</p>
            {joined ? <p className="mt-0.5 text-xs text-slate-500">Member since {joined}</p> : null}
          </div>
          <div className="p-2">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              role="menuitem"
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

