import { useState, useCallback, useEffect, useRef } from "react";
import { VENDORS0, RFQS0, QUOTES0, POS0, INVOICES0, APPROVALS0, LOGS0 } from "../data/seed";

/* ── Seed version — bump this whenever seed data changes to auto-clear old localStorage ── */
const SEED_VERSION = "v2-clean";
const SEED_VERSION_KEY = "vb_seed_version";

function clearIfSeedChanged() {
  const stored = localStorage.getItem(SEED_VERSION_KEY);
  if (stored !== SEED_VERSION) {
    Object.values(STORE_KEYS).forEach(k => localStorage.removeItem(k));
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
  }
}

/* ══════════════════════════════════════════
   Keys
══════════════════════════════════════════ */
export const STORE_KEYS = {
  vendors:    "vb_vendors",
  rfqs:       "vb_rfqs",
  quotations: "vb_quotations",
  pos:        "vb_pos",
  invoices:   "vb_invoices",
  approvals:  "vb_approvals",
  logs:       "vb_logs",
} as const;

type StoreKey = typeof STORE_KEYS[keyof typeof STORE_KEYS];

/* ══════════════════════════════════════════
   BroadcastChannel — real-time cross-tab
══════════════════════════════════════════ */
const channel = typeof BroadcastChannel !== "undefined"
  ? new BroadcastChannel("vb_realtime")
  : null;

/* ══════════════════════════════════════════
   Helpers
══════════════════════════════════════════ */
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}

/* ══════════════════════════════════════════
   Single persisted slice

   KEY DESIGN:
   - State is updated via React setState (never directly)
   - Saving to localStorage happens in a useEffect watching the value
     → runs AFTER render, AFTER StrictMode double-invoke settles
     → so we only ever save the final committed value, not the intermediate one
   - Listeners only apply external updates (from other tabs / other slices)
     and are guarded by a "writing" ref to avoid echo loops
══════════════════════════════════════════ */
function usePersisted<T>(key: StoreKey, seed: T) {
  const [val, setVal] = useState<T>(() => load(key, seed));

  // Track whether WE are the ones writing, to ignore our own broadcast echo
  const isWriting = useRef(false);

  /* Persist to localStorage AFTER render (avoids StrictMode double-save) */
  useEffect(() => {
    isWriting.current = true;
    try {
      localStorage.setItem(key, JSON.stringify(val));
      // Notify other slices in same tab
      window.dispatchEvent(
        new CustomEvent("vb-store-update", { detail: { key, value: val } })
      );
      // Notify other tabs
      channel?.postMessage({ key, value: val });
    } catch { /* quota */ }
    // Small timeout to clear the flag after broadcasts are processed
    const t = setTimeout(() => { isWriting.current = false; }, 50);
    return () => clearTimeout(t);
  }, [key, val]);  // runs only when val actually changes (after StrictMode settles)

  /* Listen for external updates (other tab or other slice) */
  useEffect(() => {
    const onSameTab = (e: Event) => {
      if (isWriting.current) return;   // ignore our own events
      const ev = e as CustomEvent<{ key: string; value: unknown }>;
      if (ev.detail.key === key) setVal(ev.detail.value as T);
    };

    const onBroadcast = (e: MessageEvent<{ key: string; value: unknown }>) => {
      if (e.data?.key === key) setVal(e.data.value as T);
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try { setVal(JSON.parse(e.newValue) as T); } catch { /* ignore */ }
      }
    };

    window.addEventListener("vb-store-update", onSameTab);
    window.addEventListener("storage", onStorage);
    channel?.addEventListener("message", onBroadcast);

    return () => {
      window.removeEventListener("vb-store-update", onSameTab);
      window.removeEventListener("storage", onStorage);
      channel?.removeEventListener("message", onBroadcast);
    };
  }, [key]);

  const set = useCallback((updater: T | ((prev: T) => T)) => {
    setVal(prev =>
      typeof updater === "function"
        ? (updater as (p: T) => T)(prev)
        : updater
    );
    // NO save() here — saving happens in the useEffect above after render
  }, []);

  return [val, set] as const;
}

/* ══════════════════════════════════════════
   Main store
══════════════════════════════════════════ */
export function useStore() {
  // Auto-clear localStorage if seed version changed
  clearIfSeedChanged();
  const [vendors,    setVendors]    = usePersisted(STORE_KEYS.vendors,    VENDORS0);
  const [rfqs,       setRfqs]       = usePersisted(STORE_KEYS.rfqs,       RFQS0);
  const [quotations, setQuotations] = usePersisted(STORE_KEYS.quotations, QUOTES0);
  const [pos,        setPOs]        = usePersisted(STORE_KEYS.pos,        POS0);
  const [invoices,   setInvoices]   = usePersisted(STORE_KEYS.invoices,   INVOICES0);
  const [approvals,  setApprovals]  = usePersisted(STORE_KEYS.approvals,  APPROVALS0);
  const [logs,       setLogs]       = usePersisted(STORE_KEYS.logs,       LOGS0);

  const addLog = useCallback((action: string, detail: string, by: string) => {
    setLogs(ls => [
      { id: Date.now(), action, detail, by, at: new Date().toLocaleString(), type: "" },
      ...ls,
    ]);
  }, [setLogs]);

  const resetStore = useCallback(() => {
    Object.values(STORE_KEYS).forEach(k => localStorage.removeItem(k));
    setVendors(VENDORS0);
    setRfqs(RFQS0);
    setQuotations(QUOTES0);
    setPOs(POS0);
    setInvoices(INVOICES0);
    setApprovals(APPROVALS0);
    setLogs(LOGS0);
    channel?.postMessage({ type: "reset" });
  }, []);

  return {
    vendors,    setVendors,
    rfqs,       setRfqs,
    quotations, setQuotations,
    pos,        setPOs,
    invoices,   setInvoices,
    approvals,  setApprovals,
    logs,       setLogs,
    addLog,
    resetStore,
  };
}
