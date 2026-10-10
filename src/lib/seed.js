import { daysAgo } from "./utils";

export const KEYS = {
  users: "sf_users",
  products: "sf_products",
  purchases: "sf_purchases",
  orders: "sf_orders",
  refunds: "sf_refunds",
  accounts: "sf_accounts",
  session: "sf_session",
};

export const CATEGORIES = ["Electronics", "Accessories", "Furniture", "Stationery"];
export const SUPPLIERS = ["TechSource Ltd", "Global Traders", "Prime Wholesale", "OfficeHub Co"];
export const CUSTOMERS = [
  "Olivia Bennett", "Liam Carter", "Emma Wilson", "Noah Turner",
  "Ava Martinez", "Ethan Brooks", "Sophia Reed", "Mason Clark",
];

export const seedUsers = [
  { id: "USR-001", name: "Sarah Johnson", email: "sarah@stockflow.com", role: "Admin", status: "active", joinedAt: daysAgo(400) },
  { id: "USR-002", name: "Michael Chen", email: "michael@stockflow.com", role: "Viewer", status: "active", joinedAt: daysAgo(320) },
  { id: "USR-003", name: "Priya Sharma", email: "priya@stockflow.com", role: "Viewer", status: "active", joinedAt: daysAgo(280) },
  { id: "USR-004", name: "David Miller", email: "david@stockflow.com", role: "Viewer", status: "inactive", joinedAt: daysAgo(250) },
  { id: "USR-005", name: "Aisha Rahman", email: "aisha@stockflow.com", role: "Viewer", status: "active", joinedAt: daysAgo(210) },
  { id: "USR-006", name: "Tom Harris", email: "tom@stockflow.com", role: "Viewer", status: "active", joinedAt: daysAgo(180) },
  { id: "USR-007", name: "Grace Kim", email: "grace@stockflow.com", role: "Viewer", status: "active", joinedAt: daysAgo(150) },
  { id: "USR-008", name: "Omar Farooq", email: "omar@stockflow.com", role: "Viewer", status: "inactive", joinedAt: daysAgo(120) },
  { id: "USR-009", name: "Lucy Adams", email: "lucy@stockflow.com", role: "Viewer", status: "active", joinedAt: daysAgo(90) },
  { id: "USR-010", name: "Daniel Lopez", email: "daniel@stockflow.com", role: "Viewer", status: "active", joinedAt: daysAgo(60) },
  { id: "USR-011", name: "Hannah Scott", email: "hannah@stockflow.com", role: "Viewer", status: "active", joinedAt: daysAgo(30) },
  { id: "USR-012", name: "Ryan Cooper", email: "ryan@stockflow.com", role: "Viewer", status: "inactive", joinedAt: daysAgo(10) },
];

export const seedProducts = [
  { id: "PRD-001", name: "Wireless Mouse", sku: "ELC-1001", category: "Electronics", description: "Ergonomic 2.4GHz wireless mouse.", price: 24.99, stock: 120, status: "active" },
  { id: "PRD-002", name: "Mechanical Keyboard", sku: "ELC-1002", category: "Electronics", description: "RGB mechanical keyboard, blue switches.", price: 79.0, stock: 45, status: "active" },
  { id: "PRD-003", name: "27\" Monitor", sku: "ELC-1003", category: "Electronics", description: "27 inch QHD IPS display.", price: 289.5, stock: 18, status: "active" },
  { id: "PRD-004", name: "USB-C Hub", sku: "ACC-2001", category: "Accessories", description: "7-in-1 USB-C multiport adapter.", price: 39.99, stock: 8, status: "active" },
  { id: "PRD-005", name: "Laptop Stand", sku: "ACC-2002", category: "Accessories", description: "Adjustable aluminium laptop stand.", price: 34.0, stock: 60, status: "active" },
  { id: "PRD-006", name: "Phone Case", sku: "ACC-2003", category: "Accessories", description: "Shockproof silicone case.", price: 12.5, stock: 0, status: "inactive" },
  { id: "PRD-007", name: "Office Chair", sku: "FUR-3001", category: "Furniture", description: "Mesh back ergonomic office chair.", price: 189.0, stock: 22, status: "active" },
  { id: "PRD-008", name: "Standing Desk", sku: "FUR-3002", category: "Furniture", description: "Electric height-adjustable desk.", price: 449.0, stock: 6, status: "active" },
  { id: "PRD-009", name: "Notebook Pack", sku: "STA-4001", category: "Stationery", description: "Pack of 5 ruled A5 notebooks.", price: 9.99, stock: 300, status: "active" },
  { id: "PRD-010", name: "Gel Pen Set", sku: "STA-4002", category: "Stationery", description: "Set of 12 smooth gel pens.", price: 7.49, stock: 210, status: "active" },
  { id: "PRD-011", name: "Desk Lamp", sku: "FUR-3003", category: "Furniture", description: "LED desk lamp with dimmer.", price: 29.99, stock: 3, status: "active" },
  { id: "PRD-012", name: "Webcam HD", sku: "ELC-1004", category: "Electronics", description: "1080p webcam with microphone.", price: 54.99, stock: 35, status: "active" },
];

const item = (productId, quantity) => {
  const p = seedProducts.find((x) => x.id === productId);
  return { productId, name: p.name, price: p.price, quantity };
};

const order = (id, customer, items, status, daysBack, shippingAddress) => ({
  id,
  customer,
  items,
  total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  status,
  shippingAddress,
  createdAt: daysAgo(daysBack),
});

export const seedOrders = [
  order("ORD-1001", "Olivia Bennett", [item("PRD-001", 2), item("PRD-002", 1)], "Delivered", 8, "12 Maple St, Austin, TX"),
  order("ORD-1002", "Liam Carter", [item("PRD-003", 1)], "Delivered", 6, "88 Oak Ave, Denver, CO"),
  order("ORD-1003", "Emma Wilson", [item("PRD-007", 2), item("PRD-011", 2)], "Delivered", 6, "5 Pine Rd, Seattle, WA"),
  order("ORD-1004", "Noah Turner", [item("PRD-009", 10), item("PRD-010", 5)], "Delivered", 5, "41 Lake Dr, Chicago, IL"),
  order("ORD-1005", "Ava Martinez", [item("PRD-008", 1)], "Delivered", 4, "230 Sunset Blvd, Los Angeles, CA"),
  order("ORD-1006", "Ethan Brooks", [item("PRD-004", 3), item("PRD-005", 2)], "Delivered", 3, "9 River Ln, Portland, OR"),
  order("ORD-1007", "Sophia Reed", [item("PRD-012", 2)], "Processing", 3, "77 Hill St, Boston, MA"),
  order("ORD-1008", "Mason Clark", [item("PRD-002", 2), item("PRD-001", 3)], "Cancelled", 2, "19 Cedar Ct, Miami, FL"),
  order("ORD-1009", "Olivia Bennett", [item("PRD-003", 2)], "Processing", 1, "12 Maple St, Austin, TX"),
  order("ORD-1010", "Liam Carter", [item("PRD-007", 1), item("PRD-005", 1)], "Processing", 1, "88 Oak Ave, Denver, CO"),
  order("ORD-1011", "Emma Wilson", [item("PRD-001", 5), item("PRD-010", 4)], "Processing", 0, "5 Pine Rd, Seattle, WA"),
  order("ORD-1012", "Noah Turner", [item("PRD-008", 1), item("PRD-011", 1)], "Processing", 0, "41 Lake Dr, Chicago, IL"),
];

export const seedPurchases = [
  { id: "PUR-001", supplier: "TechSource Ltd", productId: "PRD-001", productName: "Wireless Mouse", quantity: 200, unitCost: 15, totalCost: 3000, date: daysAgo(30), status: "Received", notes: "Bulk restock" },
  { id: "PUR-002", supplier: "TechSource Ltd", productId: "PRD-003", productName: "27\" Monitor", quantity: 30, unitCost: 210, totalCost: 6300, date: daysAgo(21), status: "Received", notes: "" },
  { id: "PUR-003", supplier: "Prime Wholesale", productId: "PRD-007", productName: "Office Chair", quantity: 40, unitCost: 120, totalCost: 4800, date: daysAgo(14), status: "Ordered", notes: "Expected in 5 days" },
  { id: "PUR-004", supplier: "OfficeHub Co", productId: "PRD-009", productName: "Notebook Pack", quantity: 500, unitCost: 5.5, totalCost: 2750, date: daysAgo(9), status: "Received", notes: "" },
  { id: "PUR-005", supplier: "Global Traders", productId: "PRD-004", productName: "USB-C Hub", quantity: 100, unitCost: 22, totalCost: 2200, date: daysAgo(4), status: "Pending", notes: "Awaiting approval" },
  { id: "PUR-006", supplier: "Prime Wholesale", productId: "PRD-011", productName: "Desk Lamp", quantity: 60, unitCost: 17, totalCost: 1020, date: daysAgo(2), status: "Cancelled", notes: "Supplier out of stock" },
];

export const seedRefunds = [
  { id: "REF-001", orderId: "ORD-1008", customer: "Mason Clark", amount: 274.97, reason: "Order cancelled before shipping.", status: "Completed", requestedAt: daysAgo(2) },
  { id: "REF-002", orderId: "ORD-1002", customer: "Liam Carter", amount: 289.5, reason: "Monitor arrived with a dead pixel.", status: "Approved", requestedAt: daysAgo(4) },
  { id: "REF-003", orderId: "ORD-1003", customer: "Emma Wilson", amount: 59.98, reason: "Lamps were the wrong colour.", status: "Requested", requestedAt: daysAgo(1) },
  { id: "REF-004", orderId: "ORD-1001", customer: "Olivia Bennett", amount: 79.0, reason: "Keyboard keys not registering.", status: "Rejected", requestedAt: daysAgo(5) },
];