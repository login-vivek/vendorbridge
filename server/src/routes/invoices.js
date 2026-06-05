import { Router } from "express";
import supabase from "../supabase.js";

const router = Router();

// GET /api/invoices
router.get("/", async (req, res) => {
  let query = supabase.from("invoices").select("*").order("created_at", { ascending: false });
  if (req.query.vendorId) query = query.eq("vendor_id", req.query.vendorId);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/invoices
router.post("/", async (req, res) => {
  const { data, error } = await supabase.from("invoices").insert(req.body).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// PATCH /api/invoices/:id  (e.g. mark as sent)
router.patch("/:id", async (req, res) => {
  const { data, error } = await supabase.from("invoices").update(req.body).eq("id", req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
