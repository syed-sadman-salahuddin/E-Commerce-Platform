import adapterImg from "@/components/images/Adapter.png";
import chairImg from "@/components/images/Chair.png";
import gelpenImg from "@/components/images/Gelpen.png";
import keyboardImg from "@/components/images/Keyboard.png";
import lampImg from "@/components/images/Lamp.png";
import laptopStandImg from "@/components/images/Laptop_stand.png";
import monitorImg from "@/components/images/Monitor.png";
import mouseImg from "@/components/images/Mosue.png";
import notebookImg from "@/components/images/Notebook.png";
import tableImg from "@/components/images/Table.png";

export const PRODUCT_IMAGES = {
  "PRD-001": mouseImg,
  "PRD-002": keyboardImg,
  "PRD-003": monitorImg,
  "PRD-004": adapterImg,
  "PRD-005": laptopStandImg,
  "PRD-006": adapterImg,
  "PRD-007": chairImg,
  "PRD-008": tableImg,
  "PRD-009": notebookImg,
  "PRD-010": gelpenImg,
  "PRD-011": lampImg,
  "PRD-012": monitorImg,
};

export function getProductImage(product) {
  if (!product) return null;

  if (product.id && PRODUCT_IMAGES[product.id]) {
    return PRODUCT_IMAGES[product.id];
  }

  const name = (product.name || "").toLowerCase();
  if (name.includes("mouse")) return mouseImg;
  if (name.includes("keyboard")) return keyboardImg;
  if (name.includes("monitor") || name.includes("display")) return monitorImg;
  if (name.includes("hub") || name.includes("adapter") || name.includes("usb")) return adapterImg;
  if (name.includes("stand")) return laptopStandImg;
  if (name.includes("chair")) return chairImg;
  if (name.includes("desk") || name.includes("table")) return tableImg;
  if (name.includes("notebook") || name.includes("book")) return notebookImg;
  if (name.includes("pen")) return gelpenImg;
  if (name.includes("lamp") || name.includes("light")) return lampImg;

  return null;
}
