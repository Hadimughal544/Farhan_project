import { useEffect } from "react";

export default function Modal({ open, title, description, children, onClose, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="relative flex max-h-[min(92vh,880px)] w-full max-w-lg animate-slide-up flex-col rounded-t-2xl border border-slate-200/80 bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 id="modal-title" className="font-heading text-lg font-semibold text-slate-900">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-slate-600">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
