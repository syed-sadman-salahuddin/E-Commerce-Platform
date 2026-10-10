import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { CATEGORIES } from "@/lib/seed";

const blank = {
  name: "",
  sku: "",
  category: "",
  description: "",
  price: "",
  stock: "",
  status: "",
};

export default function ProductFormDialog({ open, onClose, onSave, initialData }) {
  const [values, setValues] = useState(blank);
  const [errors, setErrors] = useState({});
  const isEdit = initialData !== null;

  useEffect(() => {
    if (open) {
      setValues(
        initialData
          ? {
              name: initialData.name,
              sku: initialData.sku,
              category: initialData.category,
              description: initialData.description,
              price: String(initialData.price),
              stock: String(initialData.stock),
              status: initialData.status,
            }
          : blank
      );
      setErrors({});
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
    const price = Number(values.price);
    if (!values.price || Number.isNaN(price) || price < 0) e.price = "Enter a valid price.";
    const stock = Number(values.stock);
    if (!values.stock || Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      e.stock = "Enter a valid whole number.";
    }
    if (!values.status) e.status = "Status is required.";
    return e;
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
          onChange={(e) => setField("category", e.target.value)}
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <Textarea
          label="Description"
          name="description"
          placeholder="Short product description..."
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price ($)"
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
            label="Stock quantity"
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

        <Select
          label="Status"
          required
          name="status"
          value={values.status}
          error={errors.status}
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