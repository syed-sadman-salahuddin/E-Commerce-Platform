
export function normalizeRole(role) {
  const normalized = role.trim().toLowerCase();
  if (normalized === "admin") return "Admin";
  if (normalized === "viewer") return "Viewer";
  return "User";
}

export function normalizeUsers(users) {
  return users.map((user) => ({ ...user, role: normalizeRole(user.role) }));
}

export function normalizeOrderStatus(status) {
  if (status === "Cancelled") return "Cancelled";
  if (status === "Delivered" || status === "Shipped") return "Delivered";
  return "Processing";
}

export function normalizeOrders(orders) {
  return orders.map((order) => ({
    ...order,
    status: normalizeOrderStatus(order.status),
  }));
}