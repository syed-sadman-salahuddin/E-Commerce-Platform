import { createContext, useContext, useEffect, useState } from "react";

import { normalizeRole, normalizeUsers } from "@/lib/types";
import { generateId } from "@/lib/utils";

import { KEYS, seedUsers } from "@/lib/seed";

const DEMO_ACCOUNTS = [
  {
    name: "Admin User",
    email: "admin@gmail.com",
    password: "admin123",
    role: "Admin",
  },
  {
    name: "Sarah Johnson",
    email: "sarah@stockflow.com",
    password: "admin123",
    role: "Admin",
  },
  {
    name: "Michael Chen",
    email: "user@gmail.com",
    password: "user123",
    role: "User",
  },
  {
    name: "Tom Harris",
    email: "viewer@gmail.com",
    password: "viewer123",
    role: "Viewer",
  },
];

const AuthContext = createContext(null);

function resolveRole(email, explicitRole) {
  const normalizedEmail = (email || "").trim().toLowerCase();

  try {
    const raw = localStorage.getItem(KEYS.users);
    const users = normalizeUsers(raw ? JSON.parse(raw) : seedUsers);
    const found = users.find(
      (u) => (u.email || "").trim().toLowerCase() === normalizedEmail
    );
    if (found?.role) return found.role;
  } catch {
    // ignore
  }

  if (explicitRole) return normalizeRole(explicitRole);

  const demoMatch = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === normalizedEmail
  );
  if (demoMatch?.role) return normalizeRole(demoMatch.role);

  return "User";
}

function readAccounts() {
  try {
    const raw = localStorage.getItem(KEYS.accounts);
    if (raw) {
      const existing = JSON.parse(raw);
      // Ensure all demo accounts are present
      let updated = false;
      const combined = [...existing];
      for (const demo of DEMO_ACCOUNTS) {
        if (!combined.some((a) => a.email.toLowerCase() === demo.email.toLowerCase())) {
          combined.push(demo);
          updated = true;
        }
      }
      if (updated) {
        localStorage.setItem(KEYS.accounts, JSON.stringify(combined));
      }
      return combined;
    }
  } catch {
    // ignore and fall through to the demo accounts
  }
  localStorage.setItem(KEYS.accounts, JSON.stringify(DEMO_ACCOUNTS));
  return DEMO_ACCOUNTS;
}

function saveSession(session, remember) {
  localStorage.removeItem(KEYS.session);
  sessionStorage.removeItem(KEYS.session);
  const store = remember ? localStorage : sessionStorage;
  store.setItem(KEYS.session, JSON.stringify(session));
}

function addToUsersList(account) {
  try {
    const raw = localStorage.getItem(KEYS.users);
    const users = normalizeUsers(raw ? JSON.parse(raw) : seedUsers);

    const newUser = {
      id: generateId("USR"),
      name: account.name,
      email: account.email,
      role: account.role || "User",
      status: "active",
      joinedAt: new Date().toISOString(),
    };

    localStorage.setItem(KEYS.users, JSON.stringify([newUser, ...users]));
  } catch {
    // ignore storage errors
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(KEYS.session) ??
        sessionStorage.getItem(KEYS.session);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed.role) {
          parsed.role = resolveRole(parsed.email);
        }
        setUser(parsed);
      }
    } catch {
      // ignore storage errors
    }
    setLoading(false);
  }, []);

  function login(email, password, remember) {
    const account = readAccounts().find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (!account || account.password !== password) {
      return { ok: false, error: "Invalid email or password." };
    }
    const role = resolveRole(account.email, account.role);
    const session = { name: account.name, email: account.email, role };
    saveSession(session, remember);
    setUser(session);
    return { ok: true };
  }

  function signup(name, email, password, role = "User") {
    const accounts = readAccounts();
    const exists = accounts.some(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (exists) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const account = {
      name: name.trim(),
      email: email.trim(),
      password,
      role: normalizeRole(role),
    };
    localStorage.setItem(KEYS.accounts, JSON.stringify([...accounts, account]));
    addToUsersList(account);

    const session = { name: account.name, email: account.email, role: account.role };
    saveSession(session, false);
    setUser(session);
    return { ok: true };
  }

  function switchRole(newRole) {
    if (!user) return;
    const normalized = normalizeRole(newRole);
    const updated = { ...user, role: normalized };
    try {
      if (localStorage.getItem(KEYS.session)) {
        localStorage.setItem(KEYS.session, JSON.stringify(updated));
      }
      if (sessionStorage.getItem(KEYS.session)) {
        sessionStorage.setItem(KEYS.session, JSON.stringify(updated));
      }
    } catch {
      // ignore
    }
    setUser(updated);
  }

  function logout() {
    localStorage.removeItem(KEYS.session);
    sessionStorage.removeItem(KEYS.session);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}