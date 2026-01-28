import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getProfile,
  sendInvitation,
  getPendingInvitations,
  deleteInvitation,
  verifyInvitation,
  acceptInvitation,
} from "../controllers/auth.controller.js";
import { googleAuth } from "../controllers/googleAuth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

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

// Validation for invitation
const inviteValidation = [
  body("email").isEmail().withMessage("Email invalide").normalizeEmail(),
  body("role_id").isInt({ min: 1, max: 3 }).withMessage("Role invalide"),
];

// Validation for accepting invitation
const acceptInviteValidation = [
  body("name").trim().notEmpty().withMessage("Nom requis"),
  body("password").isLength({ min: 6 }).withMessage("Mot de passe minimum 6 caracteres"),
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

/**
 * @route   POST /api/auth/google
 * @desc    Authenticate with Google OAuth
 * @access  Public
 */
router.post("/google", googleAuth);

// ============ INVITATION ROUTES ============

/**
 * @route   POST /api/auth/invite
 * @desc    Send invitation (Admin only)
 * @access  Private (Admin)
 */
router.post(
  "/invite",
  authenticateToken,
  authorize([2]),
  inviteValidation,
  sendInvitation
);

/**
 * @route   GET /api/auth/invitations
 * @desc    Get all pending invitations (Admin only)
 * @access  Private (Admin)
 */
router.get(
  "/invitations",
  authenticateToken,
  authorize([2]),
  getPendingInvitations
);

/**
 * @route   DELETE /api/auth/invitations/:id
 * @desc    Delete invitation (Admin only)
 * @access  Private (Admin)
 */
router.delete(
  "/invitations/:id",
  authenticateToken,
  authorize([2]),
  deleteInvitation
);

/**
 * @route   GET /api/auth/invite/:token
 * @desc    Verify invitation token
 * @access  Public
 */
router.get("/invite/:token", verifyInvitation);

/**
 * @route   POST /api/auth/invite/:token/accept
 * @desc    Accept invitation and create account
 * @access  Public
 */
router.post("/invite/:token/accept", acceptInviteValidation, acceptInvitation);

export default router;
