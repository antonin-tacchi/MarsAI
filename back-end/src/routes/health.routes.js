import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "marsai-api",
    timestamp: new Date().toISOString(),
  });
});

export default router;
