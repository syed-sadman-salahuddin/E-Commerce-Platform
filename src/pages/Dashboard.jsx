import {
  Users as UsersIcon,
  Package,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { KEYS, seedUsers, seedProducts, seedOrders } from "@/lib/seed";
import { getSalesLast7Days, getTopProducts, getTotalRevenue } from "@/lib/analytics";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Table, Th, Td, EmptyRow } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole, normalizeUsers } from "@/lib/types";
import UserDashboard from "@/components/dashboard/UserDashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = normalizeRole(user?.role) === "Admin";

  const [storedUsers] = useLocalStorage(KEYS.users, seedUsers);
  const users = normalizeUsers(storedUsers);
  const [products] = useLocalStorage(KEYS.products, seedProducts);
  const [orders] = useLocalStorage(KEYS.orders, seedOrders);

  if (!isAdmin) {
    return <UserDashboard />;
  }

  const revenue = getTotalRevenue(orders);
  const salesData = getSalesLast7Days(orders);
  const topProducts = getTopProducts(orders);
  const recentOrders = [...orders]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Users" value={String(users.length)} icon={UsersIcon} tone="indigo" />
        <StatCard label="Total Products" value={String(products.length)} icon={Package} tone="violet" />
        <StatCard label="Total Orders" value={String(orders.length)} icon={ShoppingCart} tone="amber" />
        <StatCard label="Revenue" value={formatCurrency(revenue)} icon={DollarSign} tone="emerald" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3">
          <h3 className="font-semibold text-slate-900">Sales trend</h3>
          <p className="mb-4 text-sm text-slate-500">Last 7 days</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Sales"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ r: 4, fill: "#4f46e5" }}
                activeDot={{ r: 6 }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="animate-fade-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h3 className="font-semibold text-slate-900">Top-selling products</h3>
          <p className="mb-4 text-sm text-slate-500">By units sold</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topProducts} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Tooltip
                formatter={(value) => [Number(value), "Units sold"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="quantity" fill="#4f46e5" radius={[0, 6, 6, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="animate-fade-up space-y-3">
        <h3 className="font-semibold text-slate-900">Recent orders</h3>
        <Table>
          <thead>
            <tr>
              <Th>Order ID</Th>
              <Th>Customer</Th>
              <Th>Items</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentOrders.length === 0 ? (
              <EmptyRow colSpan={6} message="No orders yet." />
            ) : (
              recentOrders.map((order) => (
                <tr key={order.id} className="transition hover:bg-slate-50/70">
                  <Td className="font-medium text-slate-900">{order.id}</Td>
                  <Td>{order.customer}</Td>
                  <Td>{order.items.length} item{order.items.length > 1 ? "s" : ""}</Td>
                  <Td>{formatCurrency(order.total)}</Td>
                  <Td>
                    <StatusBadge status={order.status} />
                  </Td>
                  <Td>{formatDate(order.createdAt)}</Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}