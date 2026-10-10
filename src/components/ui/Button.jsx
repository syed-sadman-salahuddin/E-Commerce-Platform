import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-4";

const variants = {
  primary:
    "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 hover:bg-indigo-700 focus-visible:ring-indigo-500/30",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400/20",
  danger:
    "bg-rose-600 text-white shadow-sm shadow-rose-600/30 hover:bg-rose-700 focus-visible:ring-rose-500/30",
  ghost: "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400/20",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}