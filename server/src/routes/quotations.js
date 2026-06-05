import { Router } from "express";
import supabase from "../supabase.js";

const router = Router();

// GET /api/quotations?rfqId=xxx
router.get("/", async (req, res) => {
  let query = supabase.from("quotations").select("*").order("submitted_at", { ascending: false });
  if (req.query.rfqId) query = query.eq("rfq_id", req.query.rfqId);
  if (req.query.vendorId) query = query.eq("vendor_id", req.query.vendorId);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/quotations
router.post("/", async (req, res) => {
  const { data, error } = await supabase.from("quotations").insert(req.body).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// PATCH /api/quotations/:id
router.patch("/:id", async (req, res) => {
  const { data, error } = await supabase.from("quotations").update(req.body).eq("id", req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
