import { useId, useState } from "react";

export default function PasswordInput({ label, error, className = "", id, ...props }) {
  const autoId = useId();
  const inputId = id || props.name || autoId;
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <div
        className={`flex items-center gap-2 rounded-lg border bg-white px-3.5 py-2.5 shadow-sm transition focus-within:ring-2 ${
          error
            ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-100"
            : "border-slate-200 focus-within:border-slate-400 focus-within:ring-slate-200"
        }`}
      >
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3l18 18M10.5 10.677a2 2 0 102.823 2.823"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.362 7.561C5.68 8.74 4.278 10.378 3.5 12c1.5 3.5 5 7 8.5 7 1.326 0 2.603-.274 3.786-.77M14.12 14.12c.243-.35.38-.776.38-1.24a2.5 2.5 0 00-3.92-2.08"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.88 5.12A8.9 8.9 0 0112 5c3.5 0 7 3.5 8.5 7-.444 1.036-1.09 2.05-1.9 2.96"
              />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12S5.25 5.25 12 5.25 21.75 12 21.75 12 18.75 18.75 12 18.75 2.25 12 2.25 12z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </button>
      </div>
      {error ? <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

