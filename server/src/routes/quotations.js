import { Router } from "express";
import Quotation from "../models/Quotation.js";
import RFQ from "../models/RFQ.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, async (req, res) => {
  const filter = {};
  if (req.query.rfqId)    filter.rfqId    = req.query.rfqId;
  if (req.query.vendorId) filter.vendorId = req.query.vendorId;
  const list = await Quotation.find(filter).sort({ createdAt: -1 });
  res.json(list);
});

router.post("/", protect, async (req, res) => {
  try {
    const q = await Quotation.create(req.body);
    await RFQ.findByIdAndUpdate(req.body.rfqId, { status: "Quoted" });
    res.status(201).json(q);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch("/:id", protect, async (req, res) => {
  try {
    const q = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(q);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;
