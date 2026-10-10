import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const first = Math.max(1, Math.min(page - 2, totalPages - 4));
  const last = Math.min(totalPages, first + 4);
  const numbers = Array.from({ length: last - first + 1 }, (_, i) => first + i);

  const arrow =
    "rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-col items-center justify-between gap-3 pt-4 sm:flex-row">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{start}</span> to{" "}
        <span className="font-medium text-slate-700">{end}</span> of{" "}
        <span className="font-medium text-slate-700">{totalItems}</span> results
      </p>

      <div className="flex items-center gap-1.5">
        <button
          className={arrow}
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {numbers.map((n) => (
          <button
            key={n}
            onClick={() => onPageChange(n)}
            className={cn(
              "h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition",
              n === page
                ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {n}
          </button>
        ))}

        <button
          className={arrow}
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}