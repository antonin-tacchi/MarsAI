import { Router } from "express";
import { getActiveFestivalConfig } from "../controllers/festivalConfig.controller.js";

const router = Router();

// GET /api/festival-config/active
router.get("/festival-config/active", getActiveFestivalConfig);

export default router;