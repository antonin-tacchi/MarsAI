import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { getAllUsers } from "../controllers/admin.controller.js";

const router = Router();

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin (later)
 */

router.get(
  "/users",
  authenticateToken, authorize([3]), getAllUsers
);

export default router;
