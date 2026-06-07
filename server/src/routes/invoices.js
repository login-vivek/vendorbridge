import { Router } from "express";
import Invoice from "../models/Invoice.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import Log from "../models/Log.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, async (req, res) => {
  const filter = {};
  if (req.query.vendorId) filter.vendorId = req.query.vendorId;
  const list = await Invoice.find(filter).sort({ createdAt: -1 });
  res.json(list);
});

router.post("/", protect, async (req, res) => {
  try {
    const inv = await Invoice.create(req.body);
    await PurchaseOrder.findByIdAndUpdate(req.body.poId, { status: "Invoiced" });
    await Log.create({ action: "Invoice Generated", detail: inv._id.toString(), by: req.user._id.toString(), type: "invoice" });
    res.status(201).json(inv);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch("/:id", protect, async (req, res) => {
  try {
    const inv = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(inv);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;
