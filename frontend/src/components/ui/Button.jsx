export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled,
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    primary:
      "bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:outline-slate-900 active:scale-[0.99]",
    secondary:
      "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-slate-400",
    ghost: "text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-400",
    danger:
      "border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 focus-visible:outline-red-400",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
