import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { formatCurrency } from "@/lib/utils";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export default function PurchaseFormDialog({ open, onClose, onSave, products, suppliers }) {
  const blank = {
    supplier: "",
    productId: "",
    quantity: "",
    unitCost: "",
    date: todayInputValue(),
    status: "",
    notes: "",
  };

  const [values, setValues] = useState(blank);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setValues(blank);
      setErrors({});
    }
  }, [open]);

  function setField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  const quantity = Number(values.quantity) || 0;
  const unitCost = Number(values.unitCost) || 0;
  const totalCost = quantity * unitCost;

  function validate() {
    const e = {};
    if (!values.supplier) e.supplier = "Supplier is required.";
    if (!values.productId) e.productId = "Select a product.";
    if (!values.quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      e.quantity = "Enter a whole number greater than 0.";
    }
    if (!values.unitCost || unitCost <= 0) e.unitCost = "Enter a valid cost.";
    if (!values.date) e.date = "Select a date.";
    if (!values.status) e.status = "Status is required.";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const product = products.find((p) => p.id === values.productId);
    onSave({
      supplier: values.supplier,
      productId: values.productId,
      productName: product?.name ?? "Unknown product",
      quantity,
      unitCost,
      totalCost,
      date: new Date(values.date).toISOString(),
      status: values.status,
      notes: values.notes,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add purchase"
      description="Record a new stock purchase from a supplier."
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Supplier"
            required
            name="supplier"
            value={values.supplier}
            error={errors.supplier}
            onChange={(e) => setField("supplier", e.target.value)}
          >
            <option value="">Select a supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.name}>
                {supplier.name}
              </option>
            ))}
          </Select>
          <Select
            label="Product"
            required
            name="productId"
            value={values.productId}
            error={errors.productId}
            onChange={(e) => setField("productId", e.target.value)}
          >
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantity"
            required
            name="quantity"
            type="number"
            min="1"
            placeholder="0"
            value={values.quantity}
            error={errors.quantity}
            onChange={(e) => setField("quantity", e.target.value)}
          />
          <Input
            label="Unit Cost ($)"
            required
            name="unitCost"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={values.unitCost}
            error={errors.unitCost}
            onChange={(e) => setField("unitCost", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Total Cost
          </label>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900">
            {formatCurrency(totalCost)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date"
            name="date"
            type="date"
            value={values.date}
            error={errors.date}
            onChange={(e) => setField("date", e.target.value)}
          />
          <Select
            label="Status"
            required
            name="status"
            value={values.status}
            error={errors.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            <option value="">Select a status</option>
            <option value="Pending">Pending</option>
            <option value="Ordered">Ordered</option>
            <option value="Received">Received</option>
            <option value="Cancelled">Cancelled</option>
          </Select>
        </div>

        <Textarea
          label="Notes"
          name="notes"
          placeholder="Optional notes..."
          value={values.notes}
          onChange={(e) => setField("notes", e.target.value)}
        />

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add purchase</Button>
        </div>
      </form>
    </Modal>
  );
}