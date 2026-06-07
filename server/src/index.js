import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";

import authRoutes       from "./routes/auth.js";
import vendorRoutes     from "./routes/vendors.js";
import rfqRoutes        from "./routes/rfqs.js";
import quotationRoutes  from "./routes/quotations.js";
import approvalRoutes   from "./routes/approvals.js";
import poRoutes         from "./routes/pos.js";
import invoiceRoutes    from "./routes/invoices.js";
import logRoutes        from "./routes/logs.js";

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth",       authRoutes);
app.use("/api/vendors",    vendorRoutes);
app.use("/api/rfqs",       rfqRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/approvals",  approvalRoutes);
app.use("/api/pos",        poRoutes);
app.use("/api/invoices",   invoiceRoutes);
app.use("/api/logs",       logRoutes);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 VendorBridge API → http://localhost:${PORT}`));
});
