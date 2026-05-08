export default function TextInput({ label, error, ...props }) {
  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
      <input
        {...props}
        className={`w-full rounded-xl border bg-slate-50/80 px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 ${
          error ? "border-red-400" : "border-slate-200"
        }`}
      />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
