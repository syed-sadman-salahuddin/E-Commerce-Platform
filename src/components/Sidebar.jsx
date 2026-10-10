import { Link, useLocation } from "react-router-dom";
import {
  Boxes,
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  ClipboardList,
  Undo2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/products", label: "Products", icon: Package },
  { href: "/purchasing", label: "Purchasing", icon: ClipboardList },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/refunds", label: "Refunds", icon: Undo2 },
];

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const { pathname } = useLocation();

  const content = (
    <>
      <div className="flex min-h-16 items-center justify-between gap-2.5 border-b border-slate-100 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Boxes size={18} />
          </div>
          <span className="text-sm font-bold leading-tight text-slate-900">
            Dekko Isho
            <br />
            Inventory
          </span>
        </div>
        <button
          onClick={onMobileClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              to={href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={18} className={active ? "text-indigo-600" : "text-slate-400"} />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-600" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-4 text-xs text-slate-400">
        Dekko Isho Inventory v1.0
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        {content}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={onMobileClose} />
          <aside className="animate-fade-up absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}