import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePagination } from "@/hooks/usePagination";
import { KEYS, seedPurchases, seedProducts } from "@/lib/seed";
import { formatCurrency, formatDate, generateId } from "@/lib/utils";
import { Table, Th, Td, EmptyRow } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PurchaseFormDialog from "@/components/purchasing/PurchaseFormDialog";
import { useToast } from "@/context/ToastContext";

const STATUSES = ["All", "Pending", "Ordered", "Received", "Cancelled"];

export default function PurchasingPage() {
  const [purchases, setPurchases, loaded] = useLocalStorage(
    KEYS.purchases,
    seedPurchases
  );
  const { showToast } = useToast();
  const [products] = useLocalStorage(KEYS.products, seedProducts);

  const [status, setStatus] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      const matchesStatus = status === "All" || p.status === status;

      const purchaseDay = p.date.slice(0, 10);
      const matchesFrom = !dateFrom || purchaseDay >= dateFrom;
      const matchesTo = !dateTo || purchaseDay <= dateTo;

      return matchesStatus && matchesFrom && matchesTo;
    });
  }, [purchases, status, dateFrom, dateTo]);

  const { page, setPage, totalPages, pageItems, totalItems, pageSize } =
    usePagination(filtered, 10);

  function handleSave(data) {
    const newPurchase = { ...data, id: generateId("PUR") };
    setPurchases((prev) => [newPurchase, ...prev]);
    showToast("Purchase recorded successfully.");
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setPurchases((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    showToast(`Deleted purchase ${deleteTarget.id}.`, "error");
    setDeleteTarget(null);
  }

  function clearFilters() {
    setStatus("All");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  if (!loaded) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All statuses" : s}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
            />
            <span>to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
            />
          </div>

          {(status !== "All" || dateFrom || dateTo) && (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Clear filters
            </button>
          )}
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          Add Purchase
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Purchase ID</Th>
            <Th>Supplier</Th>
            <Th>Product</Th>
            <Th>Quantity</Th>
            <Th>Cost</Th>
            <Th>Date</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pageItems.length === 0 ? (
            <EmptyRow colSpan={8} message="No purchases match your filters." />
          ) : (
            pageItems.map((purchase) => (
              <tr key={purchase.id} className="transition hover:bg-slate-50/70">
                <Td className="font-medium text-slate-900">{purchase.id}</Td>
                <Td>{purchase.supplier}</Td>
                <Td>{purchase.productName}</Td>
                <Td>{purchase.quantity}</Td>
                <Td>{formatCurrency(purchase.totalCost)}</Td>
                <Td className="text-slate-500">{formatDate(purchase.date)}</Td>
                <Td>
                  <StatusBadge status={purchase.status} />
                </Td>
                <Td>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setDeleteTarget(purchase)}
                      aria-label={`Delete purchase ${purchase.id}`}
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

      <PurchaseFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        products={products}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete purchase?"
        message={`This will permanently remove purchase ${deleteTarget?.id ?? ""}. This action cannot be undone.`}
      />
    </div>
  );
}