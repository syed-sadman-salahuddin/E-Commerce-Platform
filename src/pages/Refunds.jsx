import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePagination } from "@/hooks/usePagination";
import { KEYS, seedRefunds, seedOrders } from "@/lib/seed";
import { formatCurrency, formatDate, generateId } from "@/lib/utils";
import { normalizeOrders } from "@/lib/types";
import { Table, Th, Td, EmptyRow } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import RefundFormDialog from "@/components/refunds/RefundFormDialog";
import { useToast } from "@/context/ToastContext";

const STATUSES = ["All", "Requested", "Approved", "Rejected", "Completed"];

export default function RefundsPage() {
  const [refunds, setRefunds, loaded] = useLocalStorage(KEYS.refunds, seedRefunds);
  const { showToast } = useToast();
  const [storedOrders] = useLocalStorage(KEYS.orders, seedOrders);
  const orders = useMemo(() => normalizeOrders(storedOrders), [storedOrders]);

  const [status, setStatus] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    if (status === "All") return refunds;
    return refunds.filter((r) => r.status === status);
  }, [refunds, status]);

  const { page, setPage, totalPages, pageItems, totalItems, pageSize } =
    usePagination(filtered, 10);

  function handleSave(data) {
    const newRefund = {
      ...data,
      id: generateId("REF"),
      requestedAt: new Date().toISOString(),
    };
    setRefunds((prev) => [newRefund, ...prev]);
    showToast("Refund processed successfully.");
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setRefunds((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    showToast(`Deleted refund ${deleteTarget.id}.`, "error");
    setDeleteTarget(null);
  }

  function handleStatusChange(refundId, newStatus) {
    setRefunds((prev) =>
      prev.map((r) => (r.id === refundId ? { ...r, status: newStatus } : r))
    );
    showToast(`Refund ${refundId} marked as ${newStatus}.`);
  }

  if (!loaded) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 sm:w-56"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All statuses" : s}
            </option>
          ))}
        </select>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          Process Refund
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Refund ID</Th>
            <Th>Order ID</Th>
            <Th>Customer</Th>
            <Th>Amount</Th>
            <Th>Reason</Th>
            <Th>Status</Th>
            <Th>Request Date</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pageItems.length === 0 ? (
            <EmptyRow colSpan={8} message="No refunds match this filter." />
          ) : (
            pageItems.map((refund) => (
              <tr key={refund.id} className="transition hover:bg-slate-50/70">
                <Td className="font-medium text-slate-900">{refund.id}</Td>
                <Td className="text-slate-500">{refund.orderId}</Td>
                <Td>{refund.customer}</Td>
                <Td className="font-medium">{formatCurrency(refund.amount)}</Td>
                <Td className="max-w-56 truncate text-slate-500">{refund.reason}</Td>
                <Td>
                  <StatusBadge status={refund.status} />
                </Td>
                <Td className="text-slate-500">{formatDate(refund.requestedAt)}</Td>
                <Td>
                  <div className="flex items-center justify-end gap-1.5">
                    {refund.status === "Requested" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(refund.id, "Approved")}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
                          title="Approve refund"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(refund.id, "Rejected")}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
                          title="Reject refund"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {refund.status === "Approved" && (
                      <button
                        onClick={() => handleStatusChange(refund.id, "Completed")}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition"
                        title="Complete refund"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget(refund)}
                      aria-label={`Delete refund ${refund.id}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      <RefundFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        orders={orders}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete refund?"
        message={`This will permanently remove refund ${deleteTarget?.id ?? ""}. This action cannot be undone.`}
      />
    </div>
  );
}