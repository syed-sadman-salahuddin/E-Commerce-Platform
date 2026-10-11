import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { KEYS, seedOrders, seedRefunds } from "@/lib/seed";
import { normalizeOrders } from "@/lib/types";
import { formatCurrency, formatDate, generateId, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

function summarizeItems(items) {
  if (!items || items.length === 0) return "No items";
  return items.map((i) => `${i.name} (x${i.quantity})`).join(", ");
}

export default function UserDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [storedOrders, setOrders, ordersLoaded] = useLocalStorage(
    KEYS.orders,
    seedOrders
  );
  const [refunds, setRefunds] = useLocalStorage(KEYS.refunds, seedRefunds);

  const orders = useMemo(() => normalizeOrders(storedOrders), [storedOrders]);

  // Demo fallback for Michael Chen (user@gmail.com) if orders were not seeded
  useEffect(() => {
    if (ordersLoaded && user?.email === "user@gmail.com") {
      const hasUserOrders = storedOrders.some(
        (o) => (o.customer || "").trim().toLowerCase() === "michael chen"
      );
      if (!hasUserOrders) {
        const demoUserOrders = [
          {
            id: "ORD-1013",
            customer: "Michael Chen",
            items: [
              { productId: "PRD-001", name: "Wireless Mouse", price: 24.99, quantity: 1 },
              { productId: "PRD-005", name: "Laptop Stand", price: 34.0, quantity: 1 },
            ],
            total: 58.99,
            status: "Processing",
            shippingAddress: "45 Market St, San Francisco, CA",
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          },
          {
            id: "ORD-1014",
            customer: "Michael Chen",
            items: [
              { productId: "PRD-002", name: "Mechanical Keyboard", price: 79.0, quantity: 1 },
            ],
            total: 79.0,
            status: "Completed",
            shippingAddress: "45 Market St, San Francisco, CA",
            createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
          },
        ];
        setOrders((prev) => [...demoUserOrders, ...prev]);
      }
    }
  }, [user, ordersLoaded, storedOrders, setOrders]);

  // Filter only orders placed by this user
  const userOrders = useMemo(() => {
    if (!user) return [];
    const name = (user.name || "").trim().toLowerCase();
    const email = (user.email || "").trim().toLowerCase();

    return orders.filter((o) => {
      const cust = (o.customer || "").trim().toLowerCase();
      const custEmail = (o.customerEmail || "").trim().toLowerCase();
      return (name && cust === name) || (email && custEmail === email);
    });
  }, [orders, user]);

  // Filter refund requests made by this user
  const userRefunds = useMemo(() => {
    if (!user) return [];
    const name = (user.name || "").trim().toLowerCase();
    return refunds.filter(
      (r) => (r.customer || "").trim().toLowerCase() === name
    );
  }, [refunds, user]);

  const totalSpent = useMemo(() => {
    return userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [userOrders]);

  // Refund Form State
  const [refundOrderId, setRefundOrderId] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [errors, setErrors] = useState({});

  function handleSelectOrderForRefund(order) {
    setRefundOrderId(order.id);
    setRefundAmount(String(order.total));
    if (errors.orderId) setErrors((prev) => ({ ...prev, orderId: undefined }));
    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
  }

  function handleRefundSubmit(e) {
    e.preventDefault();
    const newErrors = {};

    if (!refundOrderId.trim()) {
      newErrors.orderId = "Order ID is required.";
    }

    const amt = parseFloat(refundAmount);
    if (!refundAmount || Number.isNaN(amt) || amt <= 0) {
      newErrors.amount = "Please enter a valid amount.";
    }

    if (!refundReason.trim()) {
      newErrors.reason = "Reason of refund is required.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const newRefund = {
      id: generateId("REF"),
      orderId: refundOrderId.trim(),
      customer: user?.name || "Customer",
      amount: amt,
      reason: refundReason.trim(),
      status: "Requested",
      requestedAt: new Date().toISOString(),
    };

    setRefunds((prev) => [newRefund, ...prev]);
    showToast(`Refund requested for order ${newRefund.orderId}.`);

    setRefundOrderId("");
    setRefundAmount("");
    setRefundReason("");
    setErrors({});
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* CARD 1: User Information */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-semibold text-slate-900">User Information</h3>
            <p className="text-xs text-slate-500">Personal account and session details</p>
          </div>

          <div className="my-6 flex flex-col items-center text-center">
            {/* Dummy icon of user profile */}
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 ring-4 ring-slate-50">
              <svg
                className="h-14 w-14 text-slate-400"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h4 className="text-xl font-bold text-slate-900">{user?.name || "Customer"}</h4>
            <p className="text-sm text-slate-500">{user?.email || "user@gmail.com"}</p>

            <div className="mt-3 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Account Role: {user?.role || "Viewer"}
            </div>
          </div>

          <div className="mt-auto space-y-3 border-t border-slate-100 pt-5 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-slate-50/70 p-3">
              <span className="text-slate-600">Account Status</span>
              <span className="font-semibold text-emerald-600">Active</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50/70 p-3">
              <span className="text-slate-600">Orders Placed</span>
              <span className="font-semibold text-slate-900">{userOrders.length}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50/70 p-3">
              <span className="text-slate-600">Total Spent</span>
              <span className="font-semibold text-slate-900">{formatCurrency(totalSpent)}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Orders Placed by Users */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-semibold text-slate-900">My Orders</h3>
              <p className="text-xs text-slate-500">Only orders placed by your account</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {userOrders.length} {userOrders.length === 1 ? "order" : "orders"}
            </span>
          </div>

          {userOrders.length === 0 ? (
            <div className="my-auto flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 p-8 text-center">
              <p className="text-sm font-semibold text-slate-700">No orders placed yet</p>
              <p className="mt-1 text-xs text-slate-400">
                Any orders you create will appear here with their current status.
              </p>
            </div>
          ) : (
            <div className="my-4 flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-1">
              {userOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>

                  <p className="mt-2 text-xs font-medium text-slate-700">
                    {summarizeItems(order.items)}
                  </p>

                  <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs text-slate-500">
                    <span>{formatDate(order.createdAt)}</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  {order.status === "Completed" && (
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSelectOrderForRefund(order)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Fill in refund form
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-auto border-t border-slate-100 pt-3 text-xs text-slate-400">
            Order statuses update as the fulfillment team processes your packages.
          </div>
        </div>

        {/* CARD 3: Refund */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-semibold text-slate-900">Refund</h3>
            <p className="text-xs text-slate-500">Submit a refund request for an order</p>
          </div>

          <form onSubmit={handleRefundSubmit} noValidate className="my-4 space-y-4">
            {/* Box where order id can be typed */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Order ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="orderId"
                list="user-order-ids-list"
                placeholder="Type order ID (e.g. ORD-1001)"
                value={refundOrderId}
                onChange={(e) => {
                  setRefundOrderId(e.target.value);
                  if (errors.orderId) setErrors((prev) => ({ ...prev, orderId: undefined }));
                }}
                className={cn(
                  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4",
                  errors.orderId
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/15"
                )}
              />
              {userOrders.length > 0 && (
                <datalist id="user-order-ids-list">
                  {userOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} - {formatCurrency(o.total)} ({o.status})
                    </option>
                  ))}
                </datalist>
              )}
              {errors.orderId && (
                <p className="mt-1 text-xs text-rose-600">{errors.orderId}</p>
              )}
            </div>

            {/* Customer name auto filled by session */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Customer Name
              </label>
              <input
                type="text"
                name="customer"
                value={user?.name || ""}
                readOnly
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-slate-400">Auto-filled by active session</p>
            </div>

            {/* Amount typed manually */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Amount ($) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="amount"
                placeholder="Type amount manually..."
                value={refundAmount}
                onChange={(e) => {
                  setRefundAmount(e.target.value);
                  if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
                className={cn(
                  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4",
                  errors.amount
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/15"
                )}
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-rose-600">{errors.amount}</p>
              )}
            </div>

            {/* Reason of refund */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Reason of Refund <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                name="reason"
                placeholder="Type reason of refund..."
                value={refundReason}
                onChange={(e) => {
                  setRefundReason(e.target.value);
                  if (errors.reason) setErrors((prev) => ({ ...prev, reason: undefined }));
                }}
                className={cn(
                  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4",
                  errors.reason
                    ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/15"
                )}
              />
              {errors.reason && (
                <p className="mt-1 text-xs text-rose-600">{errors.reason}</p>
              )}
            </div>

            {/* Button called Request */}
            <Button type="submit" className="w-full">
              Request
            </Button>
          </form>

          {/* User's requested refunds list */}
          {userRefunds.length > 0 && (
            <div className="mt-auto border-t border-slate-100 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Requested Refunds
                </span>
                <span className="text-xs text-slate-400">{userRefunds.length} total</span>
              </div>
              <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
                {userRefunds.map((ref) => (
                  <div
                    key={ref.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">{ref.orderId}</span>
                      <span className="ml-2 font-medium text-slate-600">
                        {formatCurrency(ref.amount)}
                      </span>
                      <div className="truncate text-slate-400 max-w-[170px]">
                        {ref.reason}
                      </div>
                    </div>
                    <StatusBadge status={ref.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
