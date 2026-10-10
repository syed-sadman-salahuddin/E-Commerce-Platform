import { AlertTriangle } from "lucide-react";
import Button from "./Button";
import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="md">
      <div className="flex gap-3 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <p>{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}