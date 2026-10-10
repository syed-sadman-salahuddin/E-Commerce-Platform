import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";

const blank = { name: "", email: "", role: "", status: "active" };

export default function UserFormDialog({ open, onClose, onSave, initialData }) {
  const [values, setValues] = useState(blank);
  const [errors, setErrors] = useState({});
  const isEdit = initialData !== null;

  useEffect(() => {
    if (open) {
      setValues(
        initialData
          ? {
              name: initialData.name,
              email: initialData.email,
              role: initialData.role,
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
    if (!values.name.trim()) e.name = "Name is required.";
    else if (values.name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (!values.email.trim()) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) e.email = "Enter a valid email address.";
    if (!values.role) e.role = "Role is required.";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    onSave({ ...values });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit user" : "Add user"}
      description={isEdit ? "Update this user's details." : "Create a new user account."}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Name"
          required
          name="name"
          placeholder="Jane Cooper"
          value={values.name}
          error={errors.name}
          onChange={(e) => setField("name", e.target.value)}
        />
        <Input
          label="Email"
          required
          name="email"
          type="email"
          placeholder="jane@company.com"
          value={values.email}
          error={errors.email}
          onChange={(e) => setField("email", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Role"
            required
            name="role"
            value={values.role}
            onChange={(e) => setField("role", e.target.value)}
          >
            <option value="Admin">Admin</option>
            <option value="">Select a role</option>
            <option value="Viewer">Viewer</option>
          </Select>
          <Select
            label="Status"
            name="status"
            value={values.status}
            onChange={(e) => setField("status", e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? "Save changes" : "Add user"}</Button>
        </div>
      </form>
    </Modal>
  );
}