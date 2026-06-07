import { Router } from "express";
import Vendor from "../models/Vendor.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, async (_req, res) => {
  const vendors = await Vendor.find().sort({ name: 1 });
  res.json(vendors);
});

router.get("/:id", protect, async (req, res) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor) return res.status(404).json({ error: "Not found" });
  res.json(vendor);
});

router.post("/", protect, async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body);
    res.status(201).json(vendor);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch("/:id", protect, async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(vendor);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;
