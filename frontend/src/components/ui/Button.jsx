export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled,
  ...rest
}) {
  const base =
    "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-soft hover:from-blue-700 hover:to-blue-600 focus-visible:outline-blue-600 active:scale-[0.99]",
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
