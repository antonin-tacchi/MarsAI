import { Router } from "express";
import { body } from "express-validator";
import {
  login,
  getProfile,
  createUser,
  getAllUsers,
  deleteUser,
  sendInvitation,
  getInvitation,
  acceptInvitation,
  getPendingInvitations,
  deleteInvitation,
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
    .withMessage("Le mot de passe doit contenir au moins 6 caracteres"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Le nom est requis"),
  body("role")
    .optional()
    .isIn(["jury", "admin"])
    .withMessage("Le role doit etre 'jury' ou 'admin'"),
];

// Validation rules for sending invitation
const invitationValidation = [
  body("email")
    .isEmail()
    .withMessage("Email invalide")
    .normalizeEmail(),
  body("name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Le nom ne doit pas depasser 100 caracteres"),
  body("role")
    .optional()
    .isIn(["jury", "admin"])
    .withMessage("Le role doit etre 'jury' ou 'admin'"),
];

// Validation rules for accepting invitation
const acceptInvitationValidation = [
  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caracteres"),
  body("name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Le nom ne doit pas depasser 100 caracteres"),
];

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * @route   POST /api/auth/login
 * @desc    Login (Jury/Admin only)
 * @access  Public
 */
router.post("/login", loginValidation, login);

/**
 * @route   GET /api/auth/invite/:token
 * @desc    Get invitation info
 * @access  Public
 */
router.get("/invite/:token", getInvitation);

/**
 * @route   POST /api/auth/invite/:token/accept
 * @desc    Accept invitation and create account
 * @access  Public
 */
router.post("/invite/:token/accept", acceptInvitationValidation, acceptInvitation);

// ============================================
// PROTECTED ROUTES (Authenticated users)
// ============================================

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private (Jury/Admin)
 */
router.get("/profile", authenticateToken, getProfile);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

/**
 * @route   POST /api/auth/invite
 * @desc    Send invitation to new user
 * @access  Admin only
 */
router.post(
  "/invite",
  authenticateToken,
  authorize([2]),
  invitationValidation,
  sendInvitation
);

/**
 * @route   GET /api/auth/invitations
 * @desc    Get all pending invitations
 * @access  Admin only
 */
router.get(
  "/invitations",
  authenticateToken,
  authorize([2]),
  getPendingInvitations
);

/**
 * @route   DELETE /api/auth/invitations/:id
 * @desc    Cancel/delete an invitation
 * @access  Admin only
 */
router.delete(
  "/invitations/:id",
  authenticateToken,
  authorize([2]),
  deleteInvitation
);

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
