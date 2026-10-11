
export function normalizeRole(role) {
  return String(role || "").trim().toLowerCase() === "admin" ? "Admin" : "Viewer";
}

export function normalizeUsers(users) {
  return users.map((user) => ({ ...user, role: normalizeRole(user.role) }));
}

export function normalizeOrderStatus(status) {
  if (status === "Cancelled" || status === "Shipped" || status === "Completed") {
    return status;
  }
  if (status === "Delivered") return "Completed";
  return "Processing";
}

export function normalizeOrders(orders) {
  return orders.map((order) => ({
    ...order,
    status: normalizeOrderStatus(order.status),
  }));
}