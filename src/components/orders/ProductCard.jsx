import { Check, Plus, Minus, PackageX } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { getProductImage } from "./productImages";

export default function ProductCard({
  product,
  isSelected,
  onToggleSelect,
  quantity,
  onQuantityChange,
}) {
  const imageSrc = getProductImage(product);
  const isOutOfStock = product.stock <= 0 || product.status === "inactive";

  function handleClick() {
    if (isOutOfStock) return;
    onToggleSelect(product);
  }

  function updateQuantity(value) {
    const parsed = Number.parseInt(value, 10);
    const nextQuantity = Number.isNaN(parsed)
      ? 1
      : Math.max(1, Math.min(parsed, product.stock));
    onQuantityChange(product.id, nextQuantity);
  }

  function stopCardClick(event) {
    event.stopPropagation();
  }

  

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-white p-4 transition-all duration-300",
        isOutOfStock
          ? "cursor-not-allowed opacity-60 border-slate-200"
          : "cursor-pointer hover:-translate-y-1 hover:shadow-xl",
        isSelected
          ? "border-indigo-600 ring-2 ring-indigo-600/20 shadow-md bg-indigo-50/20"
          : "border-slate-200/80 hover:border-indigo-300"
      )}
    >
      {/* Top badges */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-xs backdrop-blur-md">
          {product.category}
        </span>
      </div>

      <div className="absolute right-3 top-3 z-10">
        {isSelected ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm ring-2 ring-white">
            <Check size={14} className="stroke-[3]" />
          </span>
        ) : (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium backdrop-blur-md",
              isOutOfStock
                ? "bg-rose-100/90 text-rose-700"
                : product.stock < 10
                ? "bg-amber-100/90 text-amber-700"
                : "bg-emerald-100/90 text-emerald-700"
            )}
          >
            {isOutOfStock
              ? "Out of Stock"
              : product.stock < 10
              ? `${product.stock} left`
              : "In Stock"}
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="relative mb-3 flex h-48 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50/90 p-3">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-108"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <PackageX size={36} />
            <span className="mt-1 text-xs">No image</span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col">
        <div className="mb-1">
          <h3 className="line-clamp-1 text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-slate-500 leading-relaxed min-h-[32px]">
            {product.description || "High quality inventory product."}
          </p>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
              Unit Price
            </span>
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(product.price)}
            </span>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200",
              isOutOfStock
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : isSelected
                ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                : "bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            )}
          >
            {isSelected ? (
              <>
                <Check size={14} className="stroke-[2.5]" />
                Selected
              </>
            ) : (
              <>
                <Plus size={14} />
                Select
              </>
            )}
          </button>
        </div>

        {isSelected && (
          <div
            className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3"
            onClick={stopCardClick}
          >
            <div className="flex items-center rounded-xl border border-slate-200 bg-white shadow-xs">
              <button
                type="button"
                onClick={() => updateQuantity(quantity - 1)}
                disabled={quantity <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-l-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
                aria-label={`Decrease ${product.name} quantity`}
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(event) => updateQuantity(event.target.value)}
                className="h-8 w-12 border-x border-slate-200 text-center text-xs font-semibold text-slate-900 outline-none"
                aria-label={`${product.name} quantity`}
              />
              <button
                type="button"
                onClick={() => updateQuantity(quantity + 1)}
                disabled={quantity >= product.stock}
                className="flex h-8 w-8 items-center justify-center rounded-r-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
                aria-label={`Increase ${product.name} quantity`}
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Subtotal</p>
              <p className="text-sm font-bold text-slate-900">
                {formatCurrency(product.price * quantity)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
