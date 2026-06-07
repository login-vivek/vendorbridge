import { useState, useCallback, useEffect } from "react";
import { api, norm } from "../api/client";

/* ── BroadcastChannel for real-time cross-tab updates ── */
const channel = typeof BroadcastChannel !== "undefined"
  ? new BroadcastChannel("vb_realtime")
  : null;

/* ── Broadcast a data change to all other tabs ── */
function broadcast(key: string, value: unknown) {
  channel?.postMessage({ key, value });
}

/* ── Single reactive slice backed by the API ── */
function useApiSlice<T>(key: string, fetcher: () => Promise<T[]>) {
  const [data, setData]     = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  /* Fetch on mount */
  useEffect(() => {
    setLoading(true);
    fetcher()
      .then(raw => setData(norm(raw)))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Cross-tab sync */
  useEffect(() => {
    const handler = (e: MessageEvent<{ key: string; value: unknown }>) => {
      if (e.data?.key === key) setData(e.data.value as T[]);
    };
    channel?.addEventListener("message", handler);
    return () => channel?.removeEventListener("message", handler);
  }, [key]);

  const setAndBroadcast = useCallback((updater: T[] | ((prev: T[]) => T[])) => {
    setData(prev => {
      const next = typeof updater === "function" ? (updater as any)(prev) : updater;
      broadcast(key, next);
      return next;
    });
  }, [key]);

  return [data, setAndBroadcast, loading] as const;
}

/* ══════════════════════════════════════════
   Main store — all data from MongoDB
══════════════════════════════════════════ */
export function useStore() {
  const [vendors,    setVendors,    loadingVendors]    = useApiSlice("vendors",    api.getVendors);
  const [rfqs,       setRfqs,       loadingRfqs]       = useApiSlice("rfqs",       api.getRfqs);
  const [quotations, setQuotations, loadingQuotations] = useApiSlice("quotations", api.getQuotations);
  const [pos,        setPOs,        loadingPos]        = useApiSlice("pos",        api.getPOs);
  const [invoices,   setInvoices,   loadingInvoices]   = useApiSlice("invoices",   api.getInvoices);
  const [approvals,  setApprovals,  loadingApprovals]  = useApiSlice("approvals",  api.getApprovals);
  const [logs,       setLogs,       loadingLogs]       = useApiSlice("logs",       api.getLogs);

  const loading = loadingVendors || loadingRfqs || loadingQuotations ||
                  loadingPos || loadingInvoices || loadingApprovals || loadingLogs;

  /* Add a log entry (fire-and-forget — optimistic UI) */
  const addLog = useCallback((action: string, detail: string, by: string) => {
    const entry = { id: Date.now(), action, detail, by, at: new Date().toLocaleString(), type: "" };
    setLogs(ls => [entry, ...ls]);
    api.createLog({ action, detail, by }).catch(() => {/* silent */});
  }, [setLogs]);

  /* Refresh all data from server (useful after bulk operations) */
  const refreshAll = useCallback(async () => {
    const [v, r, q, p, inv, apr, lg] = await Promise.all([
      api.getVendors(),
      api.getRfqs(),
      api.getQuotations(),
      api.getPOs(),
      api.getInvoices(),
      api.getApprovals(),
      api.getLogs(),
    ]);
    setVendors(norm(v));
    setRfqs(norm(r));
    setQuotations(norm(q));
    setPOs(norm(p));
    setInvoices(norm(inv));
    setApprovals(norm(apr));
    setLogs(norm(lg));
  }, []);

  /* Reset — clears all data (admin only) */
  const resetStore = useCallback(() => {
    /* Nothing to do on client — just refresh from server */
    refreshAll();
  }, [refreshAll]);

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
    refreshAll,
    loading,
  };
}
