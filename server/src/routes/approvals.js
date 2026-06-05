import { Router } from "express";
import supabase from "../supabase.js";

const router = Router();

// GET /api/approvals
router.get("/", async (_req, res) => {
  const { data, error } = await supabase.from("approvals").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/approvals  (submit for approval)
router.post("/", async (req, res) => {
  const { data, error } = await supabase.from("approvals").insert(req.body).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// PATCH /api/approvals/:id  (approve / reject)
router.patch("/:id", async (req, res) => {
  const { data, error } = await supabase.from("approvals").update(req.body).eq("id", req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
