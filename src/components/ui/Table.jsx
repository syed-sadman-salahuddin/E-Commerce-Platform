import { cn } from "@/lib/utils";

export function Table({ children }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }) {
  return (
    <th
      className={cn(
        "whitespace-nowrap bg-slate-50/80 px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }) {
  return (
    <td className={cn("whitespace-nowrap px-5 py-4 text-slate-700", className)}>
      {children}
    </td>
  );
}

export function EmptyRow({ colSpan, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-16 text-center text-sm text-slate-400">
        {message}
      </td>
    </tr>
  );
}