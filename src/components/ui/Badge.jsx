import { cn } from "@/lib/utils";

const tones = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  red: "bg-rose-50 text-rose-700 ring-rose-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/20",
  purple: "bg-violet-50 text-violet-700 ring-violet-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

const dots = {
  green: "bg-emerald-500",
  red: "bg-rose-500",
  amber: "bg-amber-500",
  blue: "bg-sky-500",
  purple: "bg-violet-500",
  slate: "bg-slate-400",
};

export default function Badge({ tone = "slate", children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset",
        tones[tone]
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[tone])} />
      {children}
    </span>
  );
}

const statusTones = {
  active: "green",
  inactive: "slate",
  Pending: "amber",
  Processing: "blue",
  Shipped: "purple",
  Delivered: "green",
  Cancelled: "red",
  Ordered: "blue",
  Received: "green",
  Requested: "amber",
  Approved: "blue",
  Rejected: "red",
  Completed: "green",
};

export function StatusBadge({ status }) {
  return <Badge tone={statusTones[status] ?? "slate"}>{status}</Badge>;
}