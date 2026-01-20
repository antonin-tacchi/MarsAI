import { Router } from "express";
import { body } from "express-validator";
import { register, login, getProfile } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Validation rules for registration
const registerValidation = [
  body("email")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),
];

// Validation rules for login
const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", loginValidation, login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticateToken, getProfile);

export default router;
