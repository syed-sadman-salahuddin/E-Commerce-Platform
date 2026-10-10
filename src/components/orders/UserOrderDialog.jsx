import { useEffect, useState } from "react";
import { ShoppingBag, Minus, Plus, Trash2, CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { formatCurrency } from "@/lib/utils";
import { getProductImage } from "./productImages";

export default function UserOrderDialog({
  open,
  onClose,
  onSave,
  selectedProducts = [],
  currentUser,
}) {
  const [customer, setCustomer] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [quantities, setQuantities] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setCustomer(currentUser?.name || "");
      setShippingAddress("");
      // Initialize each selected product with quantity 1
      const initialQty = {};
      selectedProducts.forEach((p) => {
        initialQty[p.id] = 1;
      });
      setQuantities(initialQty);
      setErrors({});
    }
  }, [open, selectedProducts, currentUser]);

  function handleQtyChange(productId, newQty, maxStock) {
    const parsed = parseInt(newQty, 10);
    const validQty = isNaN(parsed) ? 1 : Math.max(1, Math.min(parsed, maxStock || 999));
    setQuantities((prev) => ({
      ...prev,
      [productId]: validQty,
    }));
  }

  function handleIncrement(productId, maxStock) {
    const current = quantities[productId] || 1;
    if (current < (maxStock || 999)) {
      handleQtyChange(productId, current + 1, maxStock);
    }
  }

  function handleDecrement(productId) {
    const current = quantities[productId] || 1;
    if (current > 1) {
      handleQtyChange(productId, current - 1);
    }
  }

  function handleRemoveItem(productId) {
    const updated = { ...quantities };
    delete updated[productId];
    setQuantities(updated);
  }

  const activeItems = selectedProducts.filter((p) => quantities[p.id] !== undefined);

  // Auto price calculation based on quantity
  const orderTotal = activeItems.reduce((sum, product) => {
    const qty = quantities[product.id] || 1;
    return sum + product.price * qty;
  }, 0);

  const totalQuantity = activeItems.reduce((sum, p) => sum + (quantities[p.id] || 1), 0);

  function validate() {
    const errs = {};
    if (!customer.trim() || customer.trim().length < 2) {
      errs.customer = "Customer name must be at least 2 characters.";
    }
    if (!shippingAddress.trim() || shippingAddress.trim().length < 5) {
      errs.shippingAddress = "Please provide a valid shipping address.";
    }
    if (activeItems.length === 0) {
      errs.items = "You must have at least one product selected to place an order.";
    }
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const foundErrors = validate();
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) return;

    const items = activeItems.map((product) => ({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: quantities[product.id] || 1,
    }));

    onSave({
      customer: customer.trim(),
      items,
      total: orderTotal,
      status: "Processing",
      shippingAddress: shippingAddress.trim(),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create order"
      description="Review selected products, adjust quantities, and enter shipping details."
      size="xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Customer Information */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Customer Name"
            required
            name="customer"
            placeholder="Your full name"
            value={customer}
            error={errors.customer}
            onChange={(e) => {
              setCustomer(e.target.value);
              setErrors((prev) => ({ ...prev, customer: undefined }));
            }}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Account Email
            </label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500">
              {currentUser?.email || "user@store.com"}
            </div>
          </div>
        </div>

        <Textarea
          label="Shipping Address"
          required
          name="shippingAddress"
          placeholder="Street address, Apartment/Suite, City, State, ZIP code"
          value={shippingAddress}
          error={errors.shippingAddress}
          onChange={(e) => {
            setShippingAddress(e.target.value);
            setErrors((prev) => ({ ...prev, shippingAddress: undefined }));
          }}
        />

        {/* Selected Products with Quantity & Real-time Auto Price Calculation */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">
              Selected Products ({activeItems.length})
            </span>
            <span className="text-xs text-slate-500">
              {totalQuantity} total item{totalQuantity === 1 ? "" : "s"}
            </span>
          </div>

          {errors.items && (
            <p className="mb-2 text-xs font-medium text-rose-600">{errors.items}</p>
          )}

          {activeItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              All items were removed from this cart. Please choose products from the catalog.
            </div>
          ) : (
            <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50">
              {activeItems.map((product) => {
                const qty = quantities[product.id] || 1;
                const itemTotal = product.price * qty;
                const img = getProductImage(product);

                return (
                  <div
                    key={product.id}
                    className="flex flex-col gap-3 p-3 transition sm:flex-row sm:items-center sm:justify-between hover:bg-white"
                  >
                    {/* Product Info */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white p-1 ring-1 ring-slate-200">
                        {img ? (
                          <img
                            src={img}
                            alt={product.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <ShoppingBag size={20} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{formatCurrency(product.price)} each</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-medium">
                            Stock: {product.stock}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity Controls & Line Price Calculation */}
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      {/* Quantity stepper */}
                      <div className="flex items-center rounded-xl border border-slate-200 bg-white shadow-xs">
                        <button
                          type="button"
                          onClick={() => handleDecrement(product.id)}
                          disabled={qty <= 1}
                          className="flex h-8 w-8 items-center justify-center rounded-l-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={product.stock}
                          value={qty}
                          onChange={(e) =>
                            handleQtyChange(product.id, e.target.value, product.stock)
                          }
                          className="h-8 w-12 border-x border-slate-200 text-center text-xs font-semibold text-slate-900 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleIncrement(product.id, product.stock)}
                          disabled={qty >= product.stock}
                          className="flex h-8 w-8 items-center justify-center rounded-r-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Auto calculated item subtotal */}
                      <div className="min-w-20 text-right">
                        <p className="text-xs text-slate-400">Total</p>
                        <p className="text-sm font-bold text-slate-900">
                          {formatCurrency(itemTotal)}
                        </p>
                      </div>

                      {/* Remove item button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(product.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        title="Remove product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Auto Price Calculation & Summary Card */}
        <div className="rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50/70 to-slate-50 p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal ({totalQuantity} items):</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(orderTotal)}
              </span>
            </div>
            <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between">
              <div>
                <span className="text-base font-bold text-slate-900">Total Order Amount</span>
                <span className="block text-xs text-slate-400">
                  Calculated automatically based on selected quantities
                </span>
              </div>
              <span className="text-2xl font-black text-indigo-600">
                {formatCurrency(orderTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Back to Products
          </Button>
          <Button type="submit" disabled={activeItems.length === 0}>
            <CheckCircle2 size={16} />
            Create order
          </Button>
        </div>
      </form>
    </Modal>
  );
}
