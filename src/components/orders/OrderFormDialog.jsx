import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { cn, formatCurrency } from "@/lib/utils";

const blankValues = {
  customer: "",
  shippingAddress: "",
};

export default function OrderFormDialog({ open, onClose, onSave, products }) {
  const [values, setValues] = useState(blankValues);
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setValues(blankValues);
      setRows(products.map((p) => ({ productId: p.id, selected: false, quantity: "1" })));
      setErrors({});
    }
  }, [open, products]);

  function setField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function toggleRow(productId) {
    setRows((prev) =>
      prev.map((r) => (r.productId === productId ? { ...r, selected: !r.selected } : r))
    );
    setErrors((prev) => ({ ...prev, items: undefined }));
  }

  function setRowQuantity(productId, quantity) {
    setRows((prev) =>
      prev.map((r) => (r.productId === productId ? { ...r, quantity } : r))
    );
  }

  const selectedRows = rows.filter((r) => r.selected);
  const orderTotal = selectedRows.reduce((sum, row) => {
    const product = products.find((p) => p.id === row.productId);
    const qty = Number(row.quantity) || 0;
    return sum + (product ? product.price * qty : 0);
  }, 0);

  function validate() {
    const e = {};
    if (values.customer.trim().length < 2) {
      e.customer = "Customer name must be at least 2 characters.";
    }
    if (!values.shippingAddress.trim()) e.shippingAddress = "Shipping address is required.";
    if (selectedRows.length === 0) {
      e.items = "Select at least one product.";
    } else {
      const invalid = selectedRows.some((r) => {
        const qty = Number(r.quantity);
        return !r.quantity || qty <= 0 || !Number.isInteger(qty);
      });
      if (invalid) e.items = "Every selected product needs a quantity of at least 1.";
    }
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const items = selectedRows.map((row) => {
      const product = products.find((p) => p.id === row.productId);
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: Number(row.quantity),
      };
    });

    onSave({
      customer: values.customer,
      items,
      total: orderTotal,
      status: "Processing",
      shippingAddress: values.shippingAddress,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create order"
      description="Select products and quantities for this order."
      size="xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Customer"
          required
          name="customer"
          placeholder="Customer name"
          value={values.customer}
          error={errors.customer}
          onChange={(e) => setField("customer", e.target.value)}
        />

        <Textarea
          label="Shipping Address"
          name="shippingAddress"
          placeholder="123 Main St, City, State"
          value={values.shippingAddress}
          error={errors.shippingAddress}
          onChange={(e) => setField("shippingAddress", e.target.value)}
        />

        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Products</p>
          <div
            className={cn(
              "max-h-64 space-y-1 overflow-y-auto rounded-xl border p-2",
              errors.items ? "border-rose-400" : "border-slate-200"
            )}
          >
            {products.map((product) => {
              const row = rows.find((r) => r.productId === product.id);
              if (!row) return null;
              return (
                <div
                  key={product.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 transition",
                    row.selected ? "bg-indigo-50" : "hover:bg-slate-50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={row.selected}
                    onChange={() => toggleRow(product.id)}
                    className="h-4 w-4 shrink-0 rounded border-slate-300 accent-indigo-600"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">{formatCurrency(product.price)} each</p>
                  </div>
                  {row.selected && (
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) => setRowQuantity(product.id, e.target.value)}
                      className="w-20 shrink-0 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15"
                    />
                  )}
                </div>
              );
            })}
          </div>
          {errors.items && <p className="mt-1.5 text-xs text-rose-600">{errors.items}</p>}
        </div>

        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <span className="text-sm font-medium text-slate-600">
            {selectedRows.length} product{selectedRows.length === 1 ? "" : "s"} selected
          </span>
          <span className="text-lg font-bold text-slate-900">
            {formatCurrency(orderTotal)}
          </span>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create order</Button>
        </div>
      </form>
    </Modal>
  );
}