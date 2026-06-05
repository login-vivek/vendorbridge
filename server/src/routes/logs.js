import { Router } from "express";
import supabase from "../supabase.js";

const router = Router();

// GET /api/logs
router.get("/", async (_req, res) => {
  const { data, error } = await supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(200);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/logs
router.post("/", async (req, res) => {
  const { data, error } = await supabase.from("activity_logs").insert(req.body).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

export default router;
