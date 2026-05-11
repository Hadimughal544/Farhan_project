export default function TextInput({ label, error, id, className = "", ...props }) {
  const inputId = id || props.name;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <input
        id={inputId}
        {...props}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
          error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-slate-200"
        }`}
      />
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
