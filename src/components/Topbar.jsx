import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { LogOut, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Topbar({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const role = user?.role || "Viewer";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:pl-8">
      <div className="flex min-w-0 items-center gap-2">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="truncate text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white shadow-sm">
            {user ? initials(user.name) : "?"}
          </div>
          <div className="hidden text-left sm:block">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                  role === "Admin"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {role}
              </span>
            </div>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
          <ChevronDown size={16} className="text-slate-400" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-xs text-slate-500">Current role:</span>
                  <span className="font-semibold text-indigo-600 text-xs">{role}</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}