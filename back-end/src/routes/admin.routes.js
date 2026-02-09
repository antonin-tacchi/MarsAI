import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { getAllUsers } from "../controllers/admin.controller.js";

const router = Router();

// Admin only
router.use(authenticateToken);
router.use(authorize([3]));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin
 */

router.get("/users", getAllUsers);

export default router;
