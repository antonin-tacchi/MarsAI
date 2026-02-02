import { Router } from "express";

const router = Router();

router.get("/films", (req, res) => {
  res.json({ success: true, }); 
});

export default router;
