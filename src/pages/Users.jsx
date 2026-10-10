import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/context/ToastContext";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { KEYS, seedUsers } from "@/lib/seed";
import { formatDate, generateId } from "@/lib/utils";
import { normalizeUsers, normalizeRole } from "@/lib/types";
import { Table, Th, Td, EmptyRow } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import UserFormDialog from "@/components/users/UserFormDialog";
import { useAuth } from "@/context/AuthContext";

const ROLES = ["All", "Admin", "Viewer"];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = normalizeRole(currentUser?.role) === "Admin";

  const [storedUsers, setUsers, loaded] = useLocalStorage(KEYS.users, seedUsers);
  const users = useMemo(() => normalizeUsers(storedUsers), [storedUsers]);
  const { showToast } = useToast();

  // If old data in storage has roles written differently, save the cleaned version back.
  useEffect(() => {
    if (loaded && JSON.stringify(storedUsers) !== JSON.stringify(users)) {
      setUsers(users);
    }
  }, [loaded, storedUsers, users, setUsers]);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [roleFilter, setRoleFilter] = useState("All");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, debouncedSearch, roleFilter]);

  const { page, setPage, totalPages, pageItems, totalItems, pageSize } =
    usePagination(filtered, 10);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(user) {
    setEditing(user);
    setFormOpen(true);
  }

  function handleSave(data) {
    if (editing) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editing.id ? { ...u, ...data } : u))
      );
      showToast("User updated successfully.");
    } else {
      const newUser = {
        ...data,
        id: generateId("USR"),
        joinedAt: new Date().toISOString(),
      };
      setUsers((prev) => [newUser, ...prev]);
      showToast("User added successfully.");
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    showToast(`Deleted ${deleteTarget.name}.`, "error");
    setDeleteTarget(null);
  }

  if (!loaded) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative sm:w-72">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r === "All" ? "All roles" : r}
              </option>
            ))}
          </select>
        </div>
        {isAdmin && (
          <Button onClick={openAdd}>
            <Plus size={16} />
            Add User
          </Button>
        )}
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Joined Date</Th>
            {isAdmin && <Th className="text-right">Actions</Th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pageItems.length === 0 ? (
            <EmptyRow colSpan={isAdmin ? 6 : 5} message="No users match your search." />
          ) : (
            pageItems.map((user) => (
              <tr key={user.id} className="transition hover:bg-slate-50/70">
                <Td className="font-medium text-slate-900">{user.name}</Td>
                <Td className="text-slate-500">{user.email}</Td>
                <Td>{user.role}</Td>
                <Td>
                  <StatusBadge status={user.status} />
                </Td>
                <Td className="text-slate-500">{formatDate(user.joinedAt)}</Td>
                {isAdmin && (
                  <Td>
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(user)}
                        aria-label={`Edit ${user.name}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        aria-label={`Delete ${user.name}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      <UserFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        initialData={editing}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete user?"
        message={`This will permanently remove ${deleteTarget?.name ?? "this user"}. This action cannot be undone.`}
      />
    </div>
  );
}