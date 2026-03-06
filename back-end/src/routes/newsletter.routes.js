import express from "express";
import {
  subscribe,
  confirmSubscription,
  unsubscribe,
  getSubscribers,
  sendNewsletterAdmin,
} from "../controllers/newsletter.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = express.Router();

// ── Routes publiques ──
router.post("/subscribe", subscribe);
router.get("/confirm", confirmSubscription);
router.get("/unsubscribe", unsubscribe);

// ── Routes admin (role_id = 2) ──
router.get("/subscribers", authenticateToken, authorize([2]), getSubscribers);
router.post("/send", authenticateToken, authorize([2]), sendNewsletterAdmin);

export default router;