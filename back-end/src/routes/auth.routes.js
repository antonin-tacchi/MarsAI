import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// ── Validation rules ──────────────────────────────────────────

const registerValidation = [
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("name").trim().notEmpty().withMessage("Full name is required"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// ── Public routes ─────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user — retourne must_reset_password pour les jurys
 * @access  Public
 */
router.post("/login", loginValidation, login);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Demande de réinitialisation de mot de passe (envoi email)
 * @access  Public
 */
router.post("/forgot-password", forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset le mot de passe via le token reçu par email
 * @access  Public
 */
router.post("/reset-password", resetPassword);

// ── Protected routes ──────────────────────────────────────────

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authenticateToken, getProfile);

/**
 * @route   POST /api/auth/change-password
 * @desc    Changer son mot de passe (utilisateur connecté — 1ère connexion jury ou profil)
 * @access  Private
 */
router.post("/change-password", authenticateToken, changePassword);

export default router;