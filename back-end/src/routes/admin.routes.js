import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { getAllUsers } from "../controllers/admin.controller.js";

const router = Router();

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin (later)
 */
router.get(
  "/admin/users",
  authenticateToken,
  getAllUsers
);

export default router;
