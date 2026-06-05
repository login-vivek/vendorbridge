import { createContext, useState, useEffect, type ReactNode } from "react";

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
  error:      string;
  login:      (email: string, password: string) => Promise<boolean>;
  signup:     (name: string, email: string, password: string, role: Role) => Promise<boolean>;
  logout:     () => void;
  clearError: () => void;
}

/* ══════════════════════════════════════════
   Storage keys
══════════════════════════════════════════ */
const USERS_KEY   = "vb_users";
const SESSION_KEY = "vb_session";

/* ══════════════════════════════════════════
   Helpers
══════════════════════════════════════════ */
type UserRecord = {
  name: string; email: string; passwordHash: string;
  role: Role; userId: string; vendorId?: string;
};

function getUsers(): Record<string, UserRecord> {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "{}"); }
  catch { return {}; }
}
function saveUsers(u: Record<string, UserRecord>) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(u)); } catch { /* ignore */ }
}

function hashPw(pw: string): string {
  let h = 0;
  for (let i = 0; i < pw.length; i++) h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
  return h.toString(16);
}

function initials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function recordToUser(r: UserRecord): AuthUser {
  return {
    id: r.userId, name: r.name, email: r.email,
    role: r.role, avatar: initials(r.name), vendorId: r.vendorId,
  };
}

/* ── validate a session object has all required fields ── */
function isValidSession(obj: unknown): obj is AuthUser {
  if (!obj || typeof obj !== "object") return false;
  const u = obj as Record<string, unknown>;
  return (
    typeof u.id    === "string" && u.id.length > 0 &&
    typeof u.name  === "string" && u.name.length > 0 &&
    typeof u.email === "string" && u.email.length > 0 &&
    typeof u.role  === "string" && u.role.length > 0 &&
    typeof u.avatar === "string"
  );
}

/* ── read saved session synchronously ── */
function readSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isValidSession(parsed)) return parsed;
    localStorage.removeItem(SESSION_KEY);
    return null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

/* ══════════════════════════════════════════
   Seed demo accounts
══════════════════════════════════════════ */
function seedDemos() {
  const users = getUsers();
  const demos: (Omit<UserRecord, "passwordHash"> & { pw: string })[] = [
    { email:"officer@demo.com", name:"Kavya Reddy",  role:"Procurement Officer", pw:"demo1234", userId:"officer"     },
    { email:"vendor@demo.com",  name:"Arjun Mehta",  role:"Vendor",              pw:"demo1234", userId:"vendor_V001", vendorId:"V001" },
    { email:"vendor2@demo.com", name:"Priya Shah",   role:"Vendor",              pw:"demo1234", userId:"vendor_V002", vendorId:"V002" },
    { email:"vendor3@demo.com", name:"Rahul Patel",  role:"Vendor",              pw:"demo1234", userId:"vendor_V003", vendorId:"V003" },
    { email:"manager@demo.com", name:"Rohan Desai",  role:"Manager",             pw:"demo1234", userId:"manager"     },
    { email:"admin@demo.com",   name:"Anita Sharma", role:"Admin",               pw:"demo1234", userId:"admin"       },
  ];
  let dirty = false;
  for (const d of demos) {
    if (!users[d.email]) {
      const { pw, ...rest } = d;
      users[d.email] = { ...rest, passwordHash: hashPw(pw) };
      dirty = true;
    }
  }
  if (dirty) saveUsers(users);
}

/* ══════════════════════════════════════════
   Context
══════════════════════════════════════════ */
export const AuthContext = createContext<AuthState>({
  user: null, error: "",
  login: async () => false, signup: async () => false,
  logout: () => {}, clearError: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  /* ── restore session SYNCHRONOUSLY so there's zero flash to login on refresh ── */
  const [user, setUser] = useState<AuthUser | null>(() => {
    seedDemos();
    return readSession();
  });
  const [error, setError] = useState("");

  useEffect(() => { seedDemos(); }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError("");
    const key = email.trim().toLowerCase();
    const users = getUsers();
    const record = users[key];
    if (!record) { setError("No account found with that email."); return false; }
    if (record.passwordHash !== hashPw(password)) { setError("Incorrect password."); return false; }
    const u = recordToUser(record);
    setUser(u);
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); } catch { /* ignore */ }
    return true;
  };

  const signup = async (name: string, email: string, password: string, role: Role): Promise<boolean> => {
    setError("");
    const key = email.trim().toLowerCase();
    if (!name.trim() || !key || !password) { setError("All fields are required."); return false; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return false; }
    const users = getUsers();
    if (users[key]) { setError("An account with this email already exists."); return false; }
    const userId = role === "Vendor"
      ? "vendor_" + key.replace(/[^a-z0-9]/gi, "_")
      : "u_" + key.replace(/[^a-z0-9]/gi, "_");
    users[key] = { name: name.trim(), email: key, passwordHash: hashPw(password), role, userId };
    saveUsers(users);
    return login(key, password);
  };

  const logout = () => {
    setUser(null);
    setError("");
    try { localStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    try { localStorage.removeItem("vb_current_page"); } catch { /* ignore */ }
  };

  const clearError = () => setError("");

  return (
    <AuthContext.Provider value={{ user, error, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}
