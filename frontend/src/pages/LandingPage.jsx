import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-8rem] h-[22rem] w-[22rem] rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute right-[-7rem] top-[15%] h-[24rem] w-[24rem] rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 pb-14 pt-8 md:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-cyan-200/40 bg-cyan-300/15 text-sm font-bold text-cyan-100">
              FC
            </span>
            <span className="font-heading text-xl font-bold text-white md:text-2xl">FutureCampus</span>
          </Link>

          <nav className="flex items-center gap-6 text-sm font-semibold text-slate-200">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <Link to="/login" className="transition hover:text-emerald-300">
              Login
            </Link>
          </nav>
        </header>

        <section className="auth-fade mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center text-center">
          <p className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-[0.12em] text-cyan-100 md:text-sm">
            SMART ADMISSION ADVISOR
          </p>
          <h1 className="mt-6 font-heading text-4xl font-bold leading-tight text-white md:text-6xl">
            Plan your university future with confidence
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-relaxed text-slate-200 md:text-lg">
            FutureCampus helps you discover best-fit universities using your CGPA, test scores, budget, country preference, and academic interests in one AI-powered platform.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-8 py-3.5 text-base font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:from-emerald-300 hover:to-cyan-300"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="rounded-2xl border border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white transition hover:border-cyan-300 hover:bg-white/15"
            >
              Login
            </Link>
          </div>
        </section>

        <section id="features" className="grid gap-6 pb-2 text-slate-100 md:grid-cols-3">
          <article className="space-y-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cyan-300/20 text-cyan-100">01</span>
            <h3 className="font-heading text-xl font-semibold text-white">University Matching</h3>
            <p className="text-sm leading-relaxed text-slate-300">
              Compare top universities with profile-driven filtering built around your goals.
            </p>
          </article>
          <article className="space-y-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-300/20 text-emerald-100">02</span>
            <h3 className="font-heading text-xl font-semibold text-white">Admission Chances</h3>
            <p className="text-sm leading-relaxed text-slate-300">
              Get realistic insights on your acceptance probability before applying.
            </p>
          </article>
          <article className="space-y-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-300/20 text-blue-100">03</span>
            <h3 className="font-heading text-xl font-semibold text-white">Scholarship Guidance</h3>
            <p className="text-sm leading-relaxed text-slate-300">
              Find funding options and opportunities aligned with your background.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
