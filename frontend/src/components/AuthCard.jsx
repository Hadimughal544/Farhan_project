export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="auth-fade w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-card sm:p-10">
      <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}
