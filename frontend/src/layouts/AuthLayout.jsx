import { Link } from "react-router-dom";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 text-[10px] font-bold text-white shadow-soft">
              FC
            </span>
            <span className="font-heading text-lg font-semibold text-slate-900">FutureCampus</span>
          </Link>
          <Link to="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900">
            Back to site
          </Link>
        </div>
      </header>
      <main className="mx-auto flex min-h-[calc(100vh-68px)] max-w-5xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
