import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { getProductImage } from "@/components/orders/productImages";
import { formatCurrency } from "@/lib/utils";

const ADD_CATEGORY_OPTION = "__add_category__";
const blank = {
  name: "",
  sku: "",
  category: "",
  supplierId: "",
  image: "",
  description: "",
  price: "",
  stock: "",
  status: "inactive",
};

export default function ProductFormDialog({
  open,
  onClose,
  onSave,
  initialData,
  categories,
  suppliers,
  onAddCategory,
}) {
  const [values, setValues] = useState(blank);
  const [errors, setErrors] = useState({});
  const [selectedFileName, setSelectedFileName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const isEdit = initialData !== null;

  useEffect(() => {
    if (open) {
      setValues(
        initialData
          ? {
              name: initialData.name,
              sku: initialData.sku,
              category: initialData.category,
              supplierId: initialData.supplierId ?? "",
              image: initialData.image ?? "",
              description: initialData.description,
              price: String(initialData.price),
              stock: String(initialData.stock),
              status: initialData.status,
            }
          : blank
      );
      setErrors({});
      setSelectedFileName("");
      setAddingCategory(false);
      setNewCategory("");
      setCategoryError("");
    }
  }, [open, initialData]);

  function setField(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!values.name.trim()) e.name = "Product name is required.";
    else if (values.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (!values.sku.trim()) e.sku = "SKU is required.";
    if (!values.category) e.category = "Category is required.";
    if (!values.supplierId) e.supplierId = "Supplier is required.";
    if (!values.image && !getProductImage(initialData)) {
      e.image = "Product image is required.";
    }
    const price = Number(values.price);
    if (!values.price || Number.isNaN(price) || price < 0) e.price = "Enter a valid price.";
    const stock = Number(values.stock);
    if (!values.stock || Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      e.stock = "Enter a valid whole number.";
    }
    if (!values.status) e.status = "Status is required.";
    return e;
  }

  function handleAddCategory() {
    const categoryName = newCategory.trim();
    if (!categoryName) {
      setCategoryError("Category name is required.");
      return;
    }

    const existingCategory = categories.find(
      (category) => category.toLowerCase() === categoryName.toLowerCase()
    );
    const addedCategory = onAddCategory(categoryName);
    setField("category", existingCategory ?? addedCategory);
    setAddingCategory(false);
    setNewCategory("");
    setCategoryError("");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((previous) => ({
        ...previous,
        image: "Select a valid image file.",
      }));
      return;
    }
    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setErrors((previous) => ({
          ...previous,
          image: "Could not read the selected image.",
        }));
        return;
      }
      setField("image", reader.result);
    };
    reader.onerror = () => {
      setErrors((previous) => ({
        ...previous,
        image: "Could not read the selected image.",
      }));
    };
    reader.readAsDataURL(file);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSave({
      name: values.name,
      sku: values.sku,
      category: values.category,
      supplierId: values.supplierId,
      image: values.image,
      description: values.description,
      price: Number(values.price),
      stock: Number(values.stock),
      status: values.status,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit product" : "Add product"}
      description={isEdit ? "Update this product's details." : "Add a new product to your catalog."}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Product name"
            required
            name="name"
            placeholder="Wireless Mouse"
            value={values.name}
            error={errors.name}
            onChange={(e) => setField("name", e.target.value)}
          />
          <Input
            label="SKU"
            required
            name="sku"
            placeholder="ELC-1001"
            value={values.sku}
            error={errors.sku}
            onChange={(e) => setField("sku", e.target.value)}
          />
        </div>

        <Select
          label="Category"
          required
          name="category"
          value={values.category}
          error={errors.category}
          onChange={(e) => {
            if (e.target.value === ADD_CATEGORY_OPTION) {
              setAddingCategory(true);
              setNewCategory("");
              setCategoryError("");
              setField("category", "");
              return;
            }
            setAddingCategory(false);
            setField("category", e.target.value);
          }}
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value={ADD_CATEGORY_OPTION}>Add new category...</option>
        </Select>

        {addingCategory && (
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                label="New category"
                name="newCategory"
                placeholder="Enter a category name"
                value={newCategory}
                error={categoryError}
                onChange={(e) => {
                  setNewCategory(e.target.value);
                  setCategoryError("");
                }}
              />
            </div>
            <Button type="button" variant="secondary" onClick={handleAddCategory}>
              Add category
            </Button>
          </div>
        )}

        <Select
          label="Supplier"
          required
          name="supplierId"
          value={values.supplierId}
          error={errors.supplierId}
          onChange={(e) => setField("supplierId", e.target.value)}
        >
          <option value="">Select a supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </Select>

        <div>
          <label
            htmlFor="product-image"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Product image
            {!values.image && !getProductImage(initialData) && (
              <span className="ml-1 text-rose-500" aria-hidden="true">*</span>
            )}
          </label>
          <input
            id="product-image"
            name="image"
            type="file"
            accept="image/*"
            className="sr-only"
            aria-describedby={errors.image ? "product-image-error" : undefined}
            onChange={handleImageChange}
          />
          <label
            htmlFor="product-image"
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition hover:bg-violet-700 focus-within:outline-none focus-within:ring-4 focus-within:ring-violet-500/25"
          >
            <Upload size={16} />
            Choose file
          </label>
          <span className="ml-3 text-sm text-slate-500">
            {selectedFileName || (values.image ? "Image selected" : "No file chosen")}
          </span>
          {errors.image && (
            <p id="product-image-error" className="mt-1.5 text-xs text-rose-600">
              {errors.image}
            </p>
          )}
          {(values.image || getProductImage(initialData)) && (
            <img
              src={values.image || getProductImage(initialData)}
              alt="Product preview"
              className="mt-3 h-24 w-24 rounded-xl border border-slate-200 bg-white object-contain p-2"
            />
          )}
        </div>

        <Textarea
          label="Description"
          name="description"
          placeholder="Short product description..."
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Unit Price ($)"
            required
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={values.price}
            error={errors.price}
            onChange={(e) => setField("price", e.target.value)}
          />
          <Input
            label="Stock in Quantity"
            required
            name="stock"
            type="number"
            min="0"
            placeholder="0"
            value={values.stock}
            error={errors.stock}
            onChange={(e) => setField("stock", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Total Price
          </label>
          <div className="rounded-xl border border-violet-200 bg-violet-50 px-3.5 py-2.5 text-sm font-semibold text-violet-900">
            {formatCurrency(
              (Number(values.price) || 0) * (Number(values.stock) || 0)
            )}
          </div>
        </div>

        <Select
          label="Status"
          required
          name="status"
          value={values.status}
          error={errors.status}
          disabled={!isEdit}
          onChange={(e) => setField("status", e.target.value)}
        >
          <option value="">Select a status</option>
          <option value="active">Available</option>
          <option value="inactive">Unavailable</option>
        </Select>
        
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? "Save changes" : "Add product"}</Button>
        </div>
      </form>
    </Modal>
  );
}