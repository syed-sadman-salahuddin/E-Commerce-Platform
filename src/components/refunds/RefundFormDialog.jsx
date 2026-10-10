import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { formatCurrency } from "@/lib/utils";

export default function RefundFormDialog({ open, onClose, onSave, orders }) {
  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status === "Delivered"),
    [orders]
  );

  const blank = {
    orderId: "",
    amount: "",
    reason: "",
    status: "Requested",
  };

  const [values, setValues] = useState(blank);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setValues(blank);
      setErrors({});
    }
  }, [open]);

  const selectedOrder = deliveredOrders.find((o) => o.id === values.orderId) ?? null;

  function setField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleOrderChange(orderId) {
    const order = deliveredOrders.find((o) => o.id === orderId);
    setValues((prev) => ({
      ...prev,
      orderId,
      amount: order ? String(order.total) : prev.amount,
    }));
    setErrors((prev) => ({ ...prev, orderId: undefined }));
  }

  function validate() {
    const e = {};
    if (!values.orderId || !selectedOrder) e.orderId = "Select a delivered order.";
    const amount = Number(values.amount);
    if (!values.amount || Number.isNaN(amount) || amount <= 0) {
      e.amount = "Enter a valid refund amount.";
    }
    if (!values.reason.trim()) e.reason = "A reason is required.";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0 || !selectedOrder) return;

    onSave({
      orderId: selectedOrder.id,
      customer: selectedOrder.customer,
      amount: Number(values.amount),
      reason: values.reason,
      status: values.status,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Process refund"
      description="Look up an order and record a refund against it."
      size="lg"
    >
      {deliveredOrders.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          There are no delivered orders yet, so a refund can&apos;t be created.
        </p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Order number"
            name="orderId"
            required
            list="delivered-order-numbers"
            placeholder="Search order number..."
            value={values.orderId}
            error={errors.orderId}
            onChange={(e) => handleOrderChange(e.target.value)}
          />
          <datalist id="delivered-order-numbers">
            {deliveredOrders.map((order) => (
              <option
                key={order.id}
                value={order.id}
                label={`${order.customer} - ${formatCurrency(order.total)}`}
              />
            ))}
          </datalist>

          <Input
            label="Customer"
            name="customer"
            value={selectedOrder?.customer ?? ""}
            readOnly
            disabled
          />

          <Input
            label="Refund Amount ($)"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={values.amount}
            error={errors.amount}
            onChange={(e) => setField("amount", e.target.value)}
          />

          <Textarea
            label="Reason"
            name="reason"
            placeholder="Why is this refund being requested?"
            value={values.reason}
            error={errors.reason}
            onChange={(e) => setField("reason", e.target.value)}
          />

          <Select
            label="Status"
            name="status"
            value={values.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            <option value="Requested">Requested</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Completed">Completed</option>
          </Select>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Process refund</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}