import { Router } from "express";
import Log from "../models/Log.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, async (_req, res) => {
  const logs = await Log.find().sort({ createdAt: -1 }).limit(200);
  res.json(logs);
});

router.post("/", protect, async (req, res) => {
  try {
    const log = await Log.create({ ...req.body, by: req.user._id.toString() });
    res.status(201).json(log);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

export default router;
