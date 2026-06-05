import { Router } from "express";
import supabase from "../supabase.js";

const router = Router();

// GET /api/rfqs
router.get("/", async (_req, res) => {
  const { data, error } = await supabase.from("rfqs").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/rfqs/:id
router.get("/:id", async (req, res) => {
  const { data, error } = await supabase.from("rfqs").select("*").eq("id", req.params.id).single();
  if (error) return res.status(404).json({ error: "RFQ not found" });
  res.json(data);
});

// POST /api/rfqs
router.post("/", async (req, res) => {
  const { data, error } = await supabase.from("rfqs").insert(req.body).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// PATCH /api/rfqs/:id  (e.g. close an RFQ)
router.patch("/:id", async (req, res) => {
  const { data, error } = await supabase.from("rfqs").update(req.body).eq("id", req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
