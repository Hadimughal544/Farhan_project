import { Link } from "react-router-dom";

export default function AuthLayout({ children }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-8rem] h-[22rem] w-[22rem] rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute right-[-7rem] top-[18%] h-[24rem] w-[24rem] rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl" />
      </div>

      <div className="relative mx-auto min-h-screen w-full max-w-7xl px-6 pb-12 pt-8 md:px-10 lg:px-16">
        <header className="mb-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-cyan-200/40 bg-cyan-300/15 text-sm font-bold text-cyan-100">
              FC
            </span>
            <span className="font-heading text-xl font-bold text-white md:text-2xl">FutureCampus</span>
          </Link>
          <Link to="/" className="text-sm font-semibold text-slate-200 transition hover:text-emerald-300">
            Back to Home
          </Link>
        </header>

        <section className="grid items-center gap-10 md:grid-cols-2">
          <aside className="hidden md:block">
            <h2 className="font-heading text-4xl font-bold leading-tight text-white lg:text-5xl">
              Your future university plan starts here.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-200">
              Smart AI-Based Admission Advisor helps students choose universities using academics, budget, test scores, and interests.
            </p>
            <ul className="mt-8 space-y-4 text-sm font-medium text-slate-200">
              <li className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-cyan-300" />
                Profile-driven recommendations
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-300" />
                Secure JWT-based account access
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-300" />
                Built for your final year project
              </li>
            </ul>
          </aside>

          <div className="relative flex justify-center">{children}</div>
        </section>
      </div>
    </main>
  );
}
