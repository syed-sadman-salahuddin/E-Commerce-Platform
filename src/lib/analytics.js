export function getSalesLast7Days(orders) {
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toDateString(),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      sales: 0,
    });
  }

  for (const order of orders) {
    if (order.status === "Cancelled") continue;
    const orderDate = new Date(order.createdAt).toDateString();
    const day = days.find((d) => d.date === orderDate);
    if (day) day.sales += order.total;
  }

  return days.map(({ label, sales }) => ({ label, sales: Math.round(sales * 100) / 100 }));
}

export function getTopProducts(orders, limit = 5) {
  const totals = new Map();

  for (const order of orders) {
    if (order.status === "Cancelled") continue;
    for (const item of order.items) {
      totals.set(item.name, (totals.get(item.name) ?? 0) + item.quantity);
    }
  }

  return Array.from(totals.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
}

export function getTotalRevenue(orders) {
  return orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.total, 0);
}