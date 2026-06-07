import { Router } from "express";
import Approval from "../models/Approval.js";
import Quotation from "../models/Quotation.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import RFQ from "../models/RFQ.js";
import Log from "../models/Log.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, async (_req, res) => {
  const list = await Approval.find().sort({ createdAt: -1 });
  res.json(list);
});

router.post("/", protect, async (req, res) => {
  try {
    const apr = await Approval.create(req.body);
    await Quotation.findByIdAndUpdate(req.body.quotationId, { status: "Pending Approval" });
    res.status(201).json(apr);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch("/:id", protect, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const apr = await Approval.findById(req.params.id);
    if (!apr) return res.status(404).json({ error: "Not found" });

    apr.status     = status;
    apr.remarks    = remarks || "";
    apr.approvedBy = req.user._id.toString();
    apr.approvedAt = new Date().toLocaleString();
    apr.timeline.push({ action: status, by: req.user._id.toString(), at: new Date().toLocaleString() });
    await apr.save();

    await Quotation.findByIdAndUpdate(apr.quotationId, { status });

    if (status === "Approved") {
      const q   = await Quotation.findById(apr.quotationId);
      const rfq = await RFQ.findById(apr.rfqId);
      if (q && rfq) {
        const tax = Math.round(q.totalPrice * 0.18);
        await PurchaseOrder.create({
          rfqId: rfq._id.toString(), quotationId: q._id.toString(),
          vendorId: q.vendorId, product: rfq.product,
          quantity: rfq.quantity, unitPrice: q.unitPrice,
          subtotal: q.totalPrice, tax, total: q.totalPrice + tax,
        });
        await Log.create({ action: "PO Generated", detail: `for ${rfq.title}`, by: req.user._id.toString(), type: "po" });
      }
    }

    await Log.create({ action: `Quotation ${status}`, detail: apr.quotationId, by: req.user._id.toString(), type: "approval" });
    res.json(apr);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;
