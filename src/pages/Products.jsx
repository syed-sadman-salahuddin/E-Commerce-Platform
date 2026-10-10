import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { Plus, Search, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { KEYS, seedProducts, CATEGORIES } from "@/lib/seed";
import { cn, formatCurrency, generateId } from "@/lib/utils";
import { Table, Th, Td, EmptyRow } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ProductFormDialog from "@/components/products/ProductFormDialog";

export default function ProductsPage() {
  const [products, setProducts, loaded] = useLocalStorage(
    KEYS.products,
    seedProducts
  );

  // One-time cleanup: remove an old "imageUrl" field if it exists in saved data.
  useEffect(() => {
    if (!loaded || !products.some((product) => "imageUrl" in product)) return;

    setProducts((previous) =>
      previous.map((product) => {
        const withoutImage = { ...product };
        delete withoutImage.imageUrl;
        return withoutImage;
      })
    );
  }, [loaded, products, setProducts]);

  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("none");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    let result = products.filter((p) => {
      const matchesSearch =
        !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchesCategory = category === "All" || p.category === category;
      return matchesSearch && matchesCategory;
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "stock-asc":
          return a.stock - b.stock;
        case "stock-desc":
          return b.stock - a.stock;
        default:
          return 0;
      }
    });

    return result;
  }, [products, debouncedSearch, category, sort]);

  const { page, setPage, totalPages, pageItems, totalItems, pageSize } =
    usePagination(filtered, 10);

  function resetToFirstPage() {
    setPage(1);
  }

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(product) {
    setEditing(product);
    setFormOpen(true);
  }

  function handleSave(data) {
    if (editing) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editing.id ? { ...p, ...data } : p))
      );
      showToast("Product updated successfully.");
    } else {
      const newProduct = { ...data, id: generateId("PRD") };
      setProducts((prev) => [newProduct, ...prev]);
      showToast("Product added successfully.");
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    showToast(`Deleted ${deleteTarget.name}.`, "error");
    setDeleteTarget(null);
  }

  if (!loaded) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative sm:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetToFirstPage();
              }}
              placeholder="Search by name or SKU..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
            />
          </div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              resetToFirstPage();
            }}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
          >
            <option value="none">Sort: default</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="stock-asc">Stock: low to high</option>
            <option value="stock-desc">Stock: high to low</option>
          </select>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} />
          Add Product
        </Button>
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>SKU</Th>
            <Th>Category</Th>
            <Th>
              <span className="inline-flex items-center gap-1">
                Price <ArrowUpDown size={12} />
              </span>
            </Th>
            <Th>
              <span className="inline-flex items-center gap-1">
                Stock <ArrowUpDown size={12} />
              </span>
            </Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pageItems.length === 0 ? (
            <EmptyRow colSpan={7} message="No products match your filters." />
          ) : (
            pageItems.map((product) => (
              <tr key={product.id} className="transition hover:bg-slate-50/70">
                <Td className="font-medium text-slate-900">{product.name}</Td>
                <Td className="font-mono text-xs text-slate-500">{product.sku}</Td>
                <Td>{product.category}</Td>
                <Td>{formatCurrency(product.price)}</Td>
                <Td>
                  <span
                    className={cn(
                      "font-medium",
                      product.stock === 0
                        ? "text-rose-600"
                        : product.stock < 10
                        ? "text-amber-600"
                        : "text-slate-700"
                    )}
                  >
                    {product.stock}
                  </span>
                </Td>
                <Td>
                  <StatusBadge status={product.status} />
                </Td>
                <Td>
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => openEdit(product)}
                      aria-label={`Edit ${product.name}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      aria-label={`Delete ${product.name}`}
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

      <ProductFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialData={editing}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete product?"
        message={`This will permanently remove ${deleteTarget?.name ?? "this product"}. This action cannot be undone.`}
      />
    </div>
  );
}
