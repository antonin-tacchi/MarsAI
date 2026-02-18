import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import {
  generateDistribution,
  getDistributionOverview,
  previewDistribution,
} from "../controllers/superjury.controller.js";

const router = Router();

// Super Jury (3) et Admin (2) uniquement
router.use(authenticateToken);
router.use(authorize([2, 3]));

router.get("/overview", getDistributionOverview);
router.get("/preview", previewDistribution);
router.post("/generate", generateDistribution);

export default router;
