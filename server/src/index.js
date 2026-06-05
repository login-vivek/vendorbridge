import express from "express";
import cors from "cors";
import "dotenv/config";

import vendorRoutes     from "./routes/vendors.js";
import rfqRoutes        from "./routes/rfqs.js";
import quotationRoutes  from "./routes/quotations.js";
import poRoutes         from "./routes/pos.js";
import invoiceRoutes    from "./routes/invoices.js";
import approvalRoutes   from "./routes/approvals.js";
import logRoutes        from "./routes/logs.js";

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* ── health check ── */
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

/* ── routes ── */
app.use("/api/vendors",    vendorRoutes);
app.use("/api/rfqs",       rfqRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/pos",        poRoutes);
app.use("/api/invoices",   invoiceRoutes);
app.use("/api/approvals",  approvalRoutes);
app.use("/api/logs",       logRoutes);

app.listen(PORT, () => console.log(`VendorBridge API running on http://localhost:${PORT}`));
