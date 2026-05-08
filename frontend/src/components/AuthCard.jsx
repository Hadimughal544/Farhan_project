export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="auth-fade w-full max-w-xl rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl shadow-slate-900/30 backdrop-blur md:p-10">
      <h1 className="font-heading text-3xl font-bold text-slate-900 md:text-4xl">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">{subtitle}</p>
      <div className="mt-7">{children}</div>
    </div>
  );
}
