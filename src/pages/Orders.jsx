import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, ShoppingCart, Search, Filter } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePagination } from "@/hooks/usePagination";
import { KEYS, seedOrders, seedProducts, CATEGORIES } from "@/lib/seed";
import { formatCurrency, formatDate, generateId } from "@/lib/utils";
import { normalizeOrders, normalizeRole } from "@/lib/types";
import { Table, Th, Td, EmptyRow } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import OrderFormDialog from "@/components/orders/OrderFormDialog";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/orders/ProductCard";
import UserCartBanner from "@/components/orders/UserCartBanner";
import UserOrderDialog from "@/components/orders/UserOrderDialog";

const STATUSES = ["All", "Processing", "Delivered", "Cancelled"];
const MAX_CART_ITEMS = 5;

function summarizeItems(items) {
  if (!items || items.length === 0) return "-";
  const names = items.slice(0, MAX_CART_ITEMS).map((item) => item.name);
  const remaining = items.length - names.length;
  return remaining > 0 ? `${names.join(", ")} +${remaining} more` : names.join(", ");
}

export default function OrdersPage() {
  const { user } = useAuth();
  const userRole = normalizeRole(user?.role || "User");
  const isAdmin = userRole === "Admin";

  const [storedOrders, setOrders, loaded] = useLocalStorage(
    KEYS.orders,
    seedOrders
  );
  const orders = useMemo(() => normalizeOrders(storedOrders), [storedOrders]);
  const { showToast } = useToast();
  const [products] = useLocalStorage(KEYS.products, seedProducts);

  // Admin orders list state
  const [status, setStatus] = useState("All");
  const [adminFormOpen, setAdminFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // User / Viewer catalog state
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [userOrderFormOpen, setUserOrderFormOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("All");

  // Synchronize orders format if needed
  useEffect(() => {
    if (loaded && JSON.stringify(storedOrders) !== JSON.stringify(orders)) {
      setOrders(orders);
    }
  }, [loaded, storedOrders, orders, setOrders]);

  // Admin: Filtered orders for table
  const filteredOrders = useMemo(() => {
    if (status === "All") return orders;
    return orders.filter((o) => o.status === status);
  }, [orders, status]);

  const { page, setPage, totalPages, pageItems, totalItems, pageSize } =
    usePagination(filteredOrders, 10);

  // User/Viewer: Filtered products for card catalog
  const filteredProducts = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q);
      const matchesCategory =
        catalogCategory === "All" || p.category === catalogCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, catalogSearch, catalogCategory]);

  const selectedProducts = useMemo(() => {
    return products.filter((p) => selectedProductIds.includes(p.id));
  }, [products, selectedProductIds]);

  // Toggle selection on product cards (enforcing max 5 limit)
  function handleToggleProduct(product) {
    if (selectedProductIds.includes(product.id)) {
      setSelectedProductIds((prev) => prev.filter((id) => id !== product.id));
    } else {
      if (selectedProductIds.length >= MAX_CART_ITEMS) {
        showToast(
          `You can select at most ${MAX_CART_ITEMS} products at a time.`,
          "error"
        );
        return;
      }
      setSelectedProductIds((prev) => [...prev, product.id]);
    }
  }

  function handleRemoveProduct(productId) {
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
  }

  function handleClearSelection() {
    setSelectedProductIds([]);
  }

  // Admin order save
  function handleAdminSave(data) {
    const newOrder = {
      ...data,
      id: generateId("ORD"),
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Order ${newOrder.id} created successfully.`);
    setAdminFormOpen(false);
  }

  // Customer (User / Viewer) order save
  function handleUserOrderSave(data) {
    const newOrder = {
      ...data,
      id: generateId("ORD"),
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Order ${newOrder.id} created successfully!`);
    setSelectedProductIds([]);
    setUserOrderFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
    showToast(`Deleted order ${deleteTarget.id}.`, "error");
    setDeleteTarget(null);
  }

  if (!loaded) return null;

  // 1. ADMIN VIEW: Standard Order List Table format
  if (isAdmin) {
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

          <Button onClick={() => setAdminFormOpen(true)}>
            <Plus size={16} />
            Create Order
          </Button>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Order ID</Th>
              <Th>Customer</Th>
              <Th>Products</Th>
              <Th>Total Amount</Th>
              <Th>Status</Th>
              <Th>Order Date</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageItems.length === 0 ? (
              <EmptyRow colSpan={7} message="No orders match this filter." />
            ) : (
              pageItems.map((order) => (
                <tr key={order.id} className="transition hover:bg-slate-50/70">
                  <Td className="font-medium text-slate-900">{order.id}</Td>
                  <Td>{order.customer}</Td>
                  <Td className="max-w-56 text-slate-500">
                    {summarizeItems(order.items)}
                  </Td>
                  <Td className="font-medium">{formatCurrency(order.total)}</Td>
                  <Td>
                    <StatusBadge status={order.status} />
                  </Td>
                  <Td className="text-slate-500">{formatDate(order.createdAt)}</Td>
                  <Td>
                    <div className="flex justify-end">
                      <button
                        onClick={() => setDeleteTarget(order)}
                        aria-label={`Delete order ${order.id}`}
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

        <OrderFormDialog
          open={adminFormOpen}
          onClose={() => setAdminFormOpen(false)}
          onSave={handleAdminSave}
          products={products}
        />

        <ConfirmDialog
          open={deleteTarget !== null}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete order?"
          message={`This will permanently remove order ${deleteTarget?.id ?? ""}. This action cannot be undone.`}
        />
      </div>
    );
  }

  // 2. USER / VIEWER VIEW: Product Catalog Cards section only (Order Table is not visible)
  return (
    <div className="space-y-6 pb-24">
      {/* Search and Category Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative sm:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
            />
          </div>

          <div className="relative sm:w-52">
            <Filter
              size={14}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              value={catalogCategory}
              onChange={(e) => setCatalogCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selection info & Add to Cart button */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500">
            {selectedProductIds.length} of {MAX_CART_ITEMS} selected
          </span>

          {selectedProductIds.length > 0 && (
            <Button
              onClick={() => setUserOrderFormOpen(true)}
              className="animate-fade-up shadow-md"
            >
              <ShoppingCart size={16} />
              Add to Cart ({selectedProductIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-base font-semibold text-slate-700">No products found</p>
          <p className="mt-1 text-sm text-slate-400">
            Try searching with a different keyword or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={selectedProductIds.includes(product.id)}
              onToggleSelect={handleToggleProduct}
              disabledSelect={
                selectedProductIds.length >= MAX_CART_ITEMS &&
                !selectedProductIds.includes(product.id)
              }
            />
          ))}
        </div>
      )}

      {/* Floating Cart Banner when items are selected */}
      {selectedProductIds.length > 0 && (
        <UserCartBanner
          selectedProducts={selectedProducts}
          onRemoveProduct={handleRemoveProduct}
          onClear={handleClearSelection}
          onProceed={() => setUserOrderFormOpen(true)}
          maxLimit={MAX_CART_ITEMS}
        />
      )}

      {/* Create Order Form Dialog */}
      <UserOrderDialog
        open={userOrderFormOpen}
        onClose={() => setUserOrderFormOpen(false)}
        onSave={handleUserOrderSave}
        selectedProducts={selectedProducts}
        currentUser={user}
      />
    </div>
  );
}