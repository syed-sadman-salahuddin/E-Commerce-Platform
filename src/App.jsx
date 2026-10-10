import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import LoginPage from "@/pages/Login";
import DashboardPage from "@/pages/Dashboard";
import UsersPage from "@/pages/Users";
import ProductsPage from "@/pages/Products";
import PurchasingPage from "@/pages/Purchasing";
import OrdersPage from "@/pages/Orders";
import RefundsPage from "@/pages/Refunds";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Every route inside here is drawn inside AppLayout's <Outlet /> */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/purchasing" element={<PurchasingPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/refunds" element={<RefundsPage />} />
      </Route>

      {/* Anything else goes to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}