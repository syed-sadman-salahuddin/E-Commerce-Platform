import { ShoppingCart, ArrowRight, Trash2, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { getProductImage } from "./productImages";

export default function UserCartBanner({
  selectedProducts,
  onRemoveProduct,
  onClear,
  onProceed,
}) {
  if (selectedProducts.length === 0) return null;

  const estimatedTotal = selectedProducts.reduce(
    (sum, p) => sum + p.price * (p.quantity || 1),
    0
  );

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-4xl lg:left-72">
      <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-4">
        {/* Left: Summary & Selected Item Avatars */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-inner">
            <ShoppingCart size={20} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                {selectedProducts.length} products selected
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Est. Subtotal:{" "}
              <span className="font-semibold text-emerald-400">
                {formatCurrency(estimatedTotal)}
              </span>
            </p>
          </div>

          {/* Mini product thumbnails */}
          <div className="hidden sm:flex items-center gap-1.5 pl-2">
            {selectedProducts.map((p) => {
              const img = getProductImage(p);
              return (
                <div
                  key={p.id}
                  title={`${p.name} - ${formatCurrency(p.price)}`}
                  className="group relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-white/10 p-0.5 ring-1 ring-white/20 transition hover:ring-indigo-400"
                >
                  {img ? (
                    <img
                      src={img}
                      alt={p.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-white">
                      {p.name.charAt(0)}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveProduct(p.id);
                    }}
                    aria-label={`Remove ${p.name}`}
                    className="absolute inset-0 flex items-center justify-center bg-rose-900/80 opacity-0 transition group-hover:opacity-100"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <Button
            type="button"
            onClick={onProceed}
            className="bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-400 active:scale-95"
          >
            Add to Cart
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
