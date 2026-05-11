import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-8rem] h-[22rem] w-[22rem] rounded-full bg-slate-200/80 blur-3xl" />
        <div className="absolute right-[-7rem] top-[15%] h-[24rem] w-[24rem] rounded-full bg-slate-100/90 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-slate-100 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-14 pt-8 md:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-sm font-bold text-slate-900 shadow-sm">
              FC
            </span>
            <span className="font-heading text-xl font-bold text-slate-900 md:text-2xl">FutureCampus</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#features" className="transition hover:text-slate-900">
              Features
            </a>
            <Link to="/login" className="transition hover:text-slate-900">
              Login
            </Link>
          </nav>
        </header>

        <section className="auth-fade mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center text-center">
          <p className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold tracking-[0.12em] text-slate-600 md:text-sm">
            SMART ADMISSION ADVISOR
          </p>
          <h1 className="mt-6 font-heading text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
            Plan your university future with confidence
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
            FutureCampus helps you discover best-fit universities using your CGPA, test scores, budget, country
            preference, and academic interests in one AI-powered platform.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-2xl bg-slate-900 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="rounded-2xl border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              Login
            </Link>
          </div>
        </section>

        <section id="features" className="grid gap-6 pb-2 text-slate-900 md:grid-cols-3">
          <article className="space-y-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/5 text-slate-700">
              01
            </span>
            <h3 className="font-heading text-xl font-semibold text-slate-900">University Matching</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Compare top universities with profile-driven filtering built around your goals.
            </p>
          </article>
          <article className="space-y-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/5 text-slate-700">
              02
            </span>
            <h3 className="font-heading text-xl font-semibold text-slate-900">Admission Chances</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Get realistic insights on your acceptance probability before applying.
            </p>
          </article>
          <article className="space-y-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/5 text-slate-700">
              03
            </span>
            <h3 className="font-heading text-xl font-semibold text-slate-900">Scholarship Guidance</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Find funding options and opportunities aligned with your background.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
