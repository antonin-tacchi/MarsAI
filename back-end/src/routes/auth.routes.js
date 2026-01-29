import { Router } from "express";
import { body } from "express-validator";
import {
<<<<<<< HEAD
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
=======
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
>>>>>>> thomas/claude/youtube-jury-backup-flqXs
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = Router();

<<<<<<< HEAD
// Role IDs: 1 = Jury, 2 = Admin
=======
// Validation rules
const registerValidation = [
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("name").trim().notEmpty().withMessage("Full name is required"),
];
>>>>>>> thomas/claude/youtube-jury-backup-flqXs

const loginValidation = [
<<<<<<< HEAD
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
=======
  body("email").isEmail().withMessage("Invalid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const inviteValidation = [
  body("email").isEmail().withMessage("Email invalide").normalizeEmail(),
  body("role_id").isInt({ min: 1, max: 3 }).withMessage("Role invalide"),
];

const acceptInviteValidation = [
  body("name").trim().notEmpty().withMessage("Nom requis"),
  body("password").isLength({ min: 6 }).withMessage("Mot de passe minimum 6 caracteres"),
];

// ============ PUBLIC ROUTES ============

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/google", googleAuth);
>>>>>>> thomas/claude/youtube-jury-backup-flqXs

// Invitation verification (public)
router.get("/invite/:token", verifyInvitation);
router.post("/invite/:token/accept", acceptInviteValidation, acceptInvitation);

// ============ PROTECTED ROUTES ============

router.get("/profile", authenticateToken, getProfile);

// ============ ADMIN ROUTES ============

router.post("/invite", authenticateToken, authorize([2]), inviteValidation, sendInvitation);
router.get("/invitations", authenticateToken, authorize([2]), getPendingInvitations);
router.delete("/invitations/:id", authenticateToken, authorize([2]), deleteInvitation);

export default router;
