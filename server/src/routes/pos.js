import { Router } from "express";
import PurchaseOrder from "../models/PurchaseOrder.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, async (req, res) => {
  const filter = {};
  if (req.query.vendorId) filter.vendorId = req.query.vendorId;
  const list = await PurchaseOrder.find(filter).sort({ createdAt: -1 });
  res.json(list);
});

router.patch("/:id", protect, async (req, res) => {
  try {
    const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(po);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;
