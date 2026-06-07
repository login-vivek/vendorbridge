import { createContext, useState, useEffect, type ReactNode } from "react";
import { api, setToken, clearToken, getToken, norm } from "../api/client";

/* ══════════════════════════════════════════
   Types
══════════════════════════════════════════ */
export type Role = "Procurement Officer" | "Vendor" | "Manager" | "Admin";

export interface AuthUser {
  id:        string;
  name:      string;
  email:     string;
  role:      Role;
  avatar:    string;
  vendorId?: string;
}

interface AuthState {
  user:       AuthUser | null;
  ready:      boolean;
  error:      string;
  login:      (email: string, password: string) => Promise<boolean>;
  signup:     (name: string, email: string, password: string, role: Role) => Promise<boolean>;
  logout:     () => void;
  clearError: () => void;
}

/* ══════════════════════════════════════════
   Helpers
══════════════════════════════════════════ */
const SESSION_KEY = "vb_session";

function initials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function toAuthUser(raw: any): AuthUser {
  const u = norm(raw);
  return {
    id:       u.id ?? u._id,
    name:     u.name,
    email:    u.email,
    role:     u.role,
    avatar:   initials(u.name),
    vendorId: u.vendorId ?? undefined,
  };
}

function saveSession(u: AuthUser) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); } catch { /* ignore */ }
}

function readSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as AuthUser;
    if (p?.id && p?.email && p?.role) return p;
    localStorage.removeItem(SESSION_KEY);
    return null;
  } catch { return null; }
}

/* ══════════════════════════════════════════
   Context
══════════════════════════════════════════ */
export const AuthContext = createContext<AuthState>({
  user: null, ready: false, error: "",
  login: async () => false, signup: async () => false,
  logout: () => {}, clearError: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,  setUser]  = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  /* On mount — restore session from localStorage, then verify token with server */
  useEffect(() => {
    const saved = readSession();
    const token = getToken();

    if (saved && token) {
      /* Optimistically show the user, then verify in background */
      setUser(saved);
      setReady(true);
      api.me()
        .then(({ user: raw }) => {
          const u = toAuthUser(raw);
          setUser(u);
          saveSession(u);
        })
        .catch(() => {
          /* Token expired — log out */
          setUser(null);
          clearToken();
          localStorage.removeItem(SESSION_KEY);
        });
    } else {
      clearToken();
      localStorage.removeItem(SESSION_KEY);
      setReady(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError("");
    try {
      const { token, user: raw } = await api.login(email.trim().toLowerCase(), password);
      const u = toAuthUser(raw);
      setToken(token);
      saveSession(u);
      setUser(u);
      return true;
    } catch (err: any) {
      setError(err.message || "Login failed");
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string, role: Role): Promise<boolean> => {
    setError("");
    try {
      const { token, user: raw } = await api.signup(name.trim(), email.trim().toLowerCase(), password, role);
      const u = toAuthUser(raw);
      setToken(token);
      saveSession(u);
      setUser(u);
      return true;
    } catch (err: any) {
      setError(err.message || "Signup failed");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setError("");
    clearToken();
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("vb_current_page");
  };

  const clearError = () => setError("");

  return (
    <AuthContext.Provider value={{ user, ready, error, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}
