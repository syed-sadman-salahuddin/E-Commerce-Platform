import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, ShoppingCart, Search, Filter, X } from "lucide-react";
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

const STATUSES = ["All", "Processing", "Shipped", "Completed", "Cancelled"];
const ORDER_SUMMARY_ITEMS = 5;

function summarizeItems(items) {
  if (!items || items.length === 0) return "-";
  const names = items.slice(0, ORDER_SUMMARY_ITEMS).map((item) => item.name);
  const remaining = items.length - names.length;
  return remaining > 0 ? `${names.join(", ")} +${remaining} more` : names.join(", ");
}

export default function OrdersPage() {
  const { user } = useAuth();
  const userRole = normalizeRole(user?.role || "Viewer");
  const isAdmin = userRole === "Admin";

  const [storedOrders, setOrders, loaded] = useLocalStorage(
    KEYS.orders,
    seedOrders
  );
  const orders = useMemo(() => normalizeOrders(storedOrders), [storedOrders]);
  const { showToast } = useToast();
  const [products, setProducts] = useLocalStorage(KEYS.products, seedProducts);

  // Admin orders list state
  const [status, setStatus] = useState("All");
  const [adminFormOpen, setAdminFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  // Viewer catalog state
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
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

  // Viewer: Filtered products for card catalog
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
    return products
      .filter((p) => selectedProductIds.includes(p.id))
      .map((product) => ({
        ...product,
        quantity: selectedQuantities[product.id] || 1,
      }));
  }, [products, selectedProductIds, selectedQuantities]);

  // Toggle selection for any in-stock product.
  function handleToggleProduct(product) {
    if (selectedProductIds.includes(product.id)) {
      setSelectedProductIds((prev) => prev.filter((id) => id !== product.id));
      setSelectedQuantities((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
    } else {
      if (product.stock <= 0 || product.status === "inactive") {
        return;
      }
      setSelectedProductIds((prev) => [...prev, product.id]);
      setSelectedQuantities((prev) => ({ ...prev, [product.id]: 1 }));
    }
  }

  function handleRemoveProduct(productId) {
    setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
    setSelectedQuantities((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }

  function handleQuantityChange(productId, quantity) {
    setSelectedQuantities((prev) => ({ ...prev, [productId]: quantity }));
  }

  function handleClearSelection() {
    setSelectedProductIds([]);
    setSelectedQuantities({});
  }

  // Admin order save
  function handleAdminSave(data) {
    const newOrder = {
      ...data,
      status: "Processing",
      id: generateId("ORD"),
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Order ${newOrder.id} created successfully.`);
    setAdminFormOpen(false);
  }

  // Customer order save
  function handleUserOrderSave(data) {
    const orderItems = data.items.map((item) => {
      const product = products.find((available) => available.id === item.productId);
      if (
        !product ||
        product.status === "inactive" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > product.stock
      ) {
        return null;
      }
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    if (orderItems.some((item) => item === null)) {
      showToast("Some selected products no longer have enough stock.", "error");
      return;
    }

    const newOrder = {
      ...data,
      items: orderItems,
      total: orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "Processing",
      id: generateId("ORD"),
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) =>
      prev.map((product) => {
        const orderedItem = orderItems.find((item) => item.productId === product.id);
        return orderedItem
          ? { ...product, stock: product.stock - orderedItem.quantity }
          : product;
      })
    );
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Order ${newOrder.id} created successfully!`);
    setSelectedProductIds([]);
    setSelectedQuantities({});
    setUserOrderFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
    showToast(`Deleted order ${deleteTarget.id}.`, "error");
    setDeleteTarget(null);
  }

  function handleAdvanceOrder(order) {
    const { id: orderId, status: currentStatus } = order;
    const nextStatus =
      currentStatus === "Processing"
        ? "Shipped"
        : currentStatus === "Shipped"
          ? "Completed"
          : null;
    if (!nextStatus) return;

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId && order.status === currentStatus
          ? { ...order, status: nextStatus }
          : order
      )
    );
    showToast(
      nextStatus === "Shipped"
        ? `Order ${orderId} marked as shipped.`
        : `Order ${orderId} marked as completed.`
    );
  }

  function handleCancelOrder() {
    if (
      !cancelTarget ||
      (cancelTarget.status !== "Processing" && cancelTarget.status !== "Shipped")
    ) {
      return;
    }
    const { id: orderId, status: currentStatus } = cancelTarget;
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId && order.status === currentStatus
          ? { ...order, status: "Cancelled" }
          : order
      )
    );
    showToast(`Order ${orderId} cancelled.`, "error");
    setCancelTarget(null);
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

        <Table className="min-w-[1360px] table-fixed">
          <thead>
            <tr>
              <Th className="w-[13%]">Order ID</Th>
              <Th className="w-[11%]">Customer</Th>
              <Th className="w-[22%]">Products</Th>
              <Th className="w-[11%]">Total Amount</Th>
              <Th className="w-[11%]">Status</Th>
              <Th className="w-[11%]">Order Date</Th>
              <Th className="w-[8%]">Activity</Th>
              <Th className="w-[6%] text-center">Issue</Th>
              <Th className="w-[7%] text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageItems.length === 0 ? (
              <EmptyRow colSpan={9} message="No orders match this filter." />
            ) : (
              pageItems.map((order) => (
                <tr key={order.id} className="transition hover:bg-slate-50/70">
                  <Td className="font-medium text-slate-900">
                    <div className="whitespace-normal break-all">{order.id}</div>
                  </Td>
                  <Td>
                    <div className="whitespace-normal break-words">{order.customer}</div>
                  </Td>
                  <Td className="text-slate-500">
                    <div className="whitespace-normal break-words">
                      {summarizeItems(order.items)}
                    </div>
                  </Td>
                  <Td className="font-medium">{formatCurrency(order.total)}</Td>
                  <Td>
                    <StatusBadge status={order.status} />
                  </Td>
                  <Td className="text-slate-500">{formatDate(order.createdAt)}</Td>
                  <Td>
                    <Button
                      size="sm"
                      disabled={order.status !== "Processing" && order.status !== "Shipped"}
                      onClick={() => handleAdvanceOrder(order)}
                      aria-label={`Advance order ${order.id} from ${order.status}`}
                    >
                      {order.status === "Processing"
                        ? "Ready to ship"
                        : order.status === "Shipped"
                          ? "Delivered"
                          : order.status}
                    </Button>
                  </Td>
                  <Td>
                    <div className="flex justify-center">
                      <button
                        type="button"
                        disabled={order.status === "Completed" || order.status === "Cancelled"}
                        onClick={() => setCancelTarget(order)}
                        aria-label={`Cancel order ${order.id}`}
                        title={`Cancel order ${order.id}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-rose-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </Td>
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

        <ConfirmDialog
          open={cancelTarget !== null}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancelOrder}
          title="Cancel order?"
          message="Are you sure you want to cancel this order?"
          confirmLabel="Cancel order"
        />
      </div>
    );
  }

  // 2. VIEWER VIEW: Product catalog only (the order table is not visible)
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
            {selectedProductIds.length} products selected
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
              quantity={selectedQuantities[product.id] || 1}
              onQuantityChange={handleQuantityChange}
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