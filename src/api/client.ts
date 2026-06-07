/* ── Base URL ── */
export const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ── Token helpers ── */
export function getToken(): string {
  return localStorage.getItem("vb_token") || "";
}
export function setToken(t: string) {
  localStorage.setItem("vb_token", t);
}
export function clearToken() {
  localStorage.removeItem("vb_token");
}

/* ── Core fetch wrapper ── */
async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `Request failed (${res.status})`);
  return data as T;
}

/* ── Normalize MongoDB _id → id ── */
export function norm(obj: any): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) return obj.map(norm);
  const { _id, __v, ...rest } = obj;
  return { ...rest, id: _id ?? rest.id };
}

/* ── API surface ── */
export const api = {
  /* auth */
  login:  (email: string, password: string) =>
    req<{ token: string; user: any }>("POST", "/api/auth/login", { email, password }),
  signup: (name: string, email: string, password: string, role: string) =>
    req<{ token: string; user: any }>("POST", "/api/auth/signup", { name, email, password, role }),
  me: () => req<{ user: any }>("GET", "/api/auth/me"),

  /* vendors */
  getVendors:   ()                         => req<any[]>("GET",   "/api/vendors"),
  createVendor: (d: any)                   => req<any>  ("POST",  "/api/vendors", d),
  updateVendor: (id: string, d: any)       => req<any>  ("PATCH", `/api/vendors/${id}`, d),

  /* rfqs */
  getRfqs:   ()                            => req<any[]>("GET",   "/api/rfqs"),
  createRfq: (d: any)                      => req<any>  ("POST",  "/api/rfqs", d),
  updateRfq: (id: string, d: any)          => req<any>  ("PATCH", `/api/rfqs/${id}`, d),

  /* quotations */
  getQuotations: (p?: Record<string, string>) =>
    req<any[]>("GET", "/api/quotations" + (p ? "?" + new URLSearchParams(p) : "")),
  createQuotation: (d: any)                => req<any>  ("POST",  "/api/quotations", d),
  updateQuotation: (id: string, d: any)    => req<any>  ("PATCH", `/api/quotations/${id}`, d),

  /* approvals */
  getApprovals:   ()                       => req<any[]>("GET",   "/api/approvals"),
  createApproval: (d: any)                 => req<any>  ("POST",  "/api/approvals", d),
  updateApproval: (id: string, d: any)     => req<any>  ("PATCH", `/api/approvals/${id}`, d),

  /* pos */
  getPOs:   (p?: Record<string, string>)   =>
    req<any[]>("GET", "/api/pos" + (p ? "?" + new URLSearchParams(p) : "")),
  updatePO: (id: string, d: any)           => req<any>  ("PATCH", `/api/pos/${id}`, d),

  /* invoices */
  getInvoices:   (p?: Record<string, string>) =>
    req<any[]>("GET", "/api/invoices" + (p ? "?" + new URLSearchParams(p) : "")),
  createInvoice: (d: any)                  => req<any>  ("POST",  "/api/invoices", d),
  updateInvoice: (id: string, d: any)      => req<any>  ("PATCH", `/api/invoices/${id}`, d),

  /* logs */
  getLogs:   ()                            => req<any[]>("GET",  "/api/logs"),
  createLog: (d: any)                      => req<any>  ("POST", "/api/logs", d),
};
