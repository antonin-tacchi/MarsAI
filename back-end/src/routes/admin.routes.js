import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { getAllUsers } from "../controllers/admin.controller.js";
import {
  getDistributionStats,
  previewDistribution,
  generateDistribution,
} from "../controllers/superjury.controller.js";

const router = Router();

// Super Jury / Admin only (role 3)
router.use(authenticateToken);
router.use(authorize([3]));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Super Jury (role 3)
 */
router.get("/users", getAllUsers);

/**
 * @route   GET /api/admin/distribution/stats
 * @desc    Get current distribution state
 * @access  Super Jury (role 3)
 */
router.get("/distribution/stats", getDistributionStats);

/**
 * @route   POST /api/admin/distribution/preview
 * @desc    Preview a distribution (R, Lmax)
 * @access  Super Jury (role 3)
 */
router.post("/distribution/preview", previewDistribution);

/**
 * @route   POST /api/admin/distribution/generate
 * @desc    Generate the actual distribution (R, Lmax)
 * @access  Super Jury (role 3)
 */
router.post("/distribution/generate", generateDistribution);

export default router;
