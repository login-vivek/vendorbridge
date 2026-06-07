import { Router } from "express";
import RFQ from "../models/RFQ.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, async (_req, res) => {
  const rfqs = await RFQ.find().sort({ createdAt: -1 });
  res.json(rfqs);
});

router.post("/", protect, async (req, res) => {
  try {
    const rfq = await RFQ.create({ ...req.body, createdBy: req.user._id.toString() });
    res.status(201).json(rfq);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch("/:id", protect, async (req, res) => {
  try {
    const rfq = await RFQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(rfq);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;
