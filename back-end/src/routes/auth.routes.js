import { Router } from "express";
import { body } from "express-validator";
import {
  login,
  getProfile,
  createUser,
  getAllUsers,
  deleteUser,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = Router();

// Role IDs: 1 = Jury, 2 = Admin

// Validation rules for login
const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Email invalide")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Mot de passe requis"),
];

// Validation rules for creating a user
const createUserValidation = [
  body("email")
    .isEmail()
    .withMessage("Email invalide")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Le nom est requis"),
  body("role")
    .optional()
    .isIn(["jury", "admin"])
    .withMessage("Le rôle doit être 'jury' ou 'admin'"),
];

/**
 * @route   POST /api/auth/login
 * @desc    Login (Jury/Admin only)
 * @access  Public
 */
router.post("/login", loginValidation, login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private (Jury/Admin)
 */
router.get("/profile", authenticateToken, getProfile);

/**
 * @route   POST /api/auth/users
 * @desc    Create a new user (Jury or Admin)
 * @access  Admin only
 */
router.post(
  "/users",
  authenticateToken,
  authorize([2]),
  createUserValidation,
  createUser
);

/**
 * @route   GET /api/auth/users
 * @desc    Get all users
 * @access  Admin only
 */
router.get(
  "/users",
  authenticateToken,
  authorize([2]),
  getAllUsers
);

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Delete a user
 * @access  Admin only
 */
router.delete(
  "/users/:id",
  authenticateToken,
  authorize([2]),
  deleteUser
);

export default router;
