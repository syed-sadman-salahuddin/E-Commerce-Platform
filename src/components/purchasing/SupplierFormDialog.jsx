import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";

const blank = { name: "", address: "", products: "" };

export default function SupplierFormDialog({ open, onClose, onSave, suppliers }) {
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

  function handleSubmit(event) {
    event.preventDefault();
    const found = {};
    const name = values.name.trim();
    const address = values.address.trim();

    if (!name) found.name = "Supplier name is required.";
    else if (suppliers.some((supplier) => supplier.name.toLowerCase() === name.toLowerCase())) {
      found.name = "A supplier with this name already exists.";
    }
    if (!address) found.address = "Supplier address is required.";

    setErrors(found);
    if (Object.keys(found).length > 0) return;

    onSave({
      name,
      address,
      products: values.products.trim(),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add supplier"
      description="Add a supplier to the purchasing supplier list."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Supplier name"
          required
          name="name"
          placeholder="Supplier name"
          value={values.name}
          error={errors.name}
          onChange={(event) => setField("name", event.target.value)}
        />
        <Textarea
          label="Supplier address"
          required
          name="address"
          placeholder="Supplier address"
          value={values.address}
          error={errors.address}
          onChange={(event) => setField("address", event.target.value)}
        />
        <Textarea
          label="Products"
          name="products"
          placeholder="Products supplied (optional)"
          value={values.products}
          onChange={(event) => setField("products", event.target.value)}
        />

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add supplier</Button>
        </div>
      </form>
    </Modal>
  );
}
