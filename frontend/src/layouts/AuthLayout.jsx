import { Link } from "react-router-dom";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-900 text-[10px] font-bold text-white">
              FC
            </span>
            <span className="font-heading font-semibold text-slate-900">FutureCampus</span>
          </Link>
          <Link to="/" className="text-xs font-semibold text-slate-600">
            Back to site
          </Link>
        </div>
      </header>
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-5xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
