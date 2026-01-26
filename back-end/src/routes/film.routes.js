import { Router } from "express";
import { body } from "express-validator";
import {
  submitFilm,
  getAllFilms,
  getPendingFilms,
  getApprovedFilms,
  getFilmById,
  approveFilm,
  rejectFilm,
  getFilmStats,
  checkSubmissionStatus,
  deleteFilm,
} from "../controllers/film.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import { uploadFilm, uploadPoster } from "../config/upload.js";

const router = Router();

// Role IDs: 1 = Jury, 2 = Admin

// Validation rules for film submission
const submitValidation = [
  // Film Information
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Le titre est requis")
    .isLength({ max: 255 })
    .withMessage("Le titre ne doit pas depasser 255 caracteres"),
  body("country")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Le pays ne doit pas depasser 100 caracteres"),
  body("description")
    .optional()
    .isLength({ max: 5000 })
    .withMessage("La description ne doit pas depasser 5000 caracteres"),
  body("youtube_link")
    .optional()
    .isURL()
    .withMessage("Lien YouTube invalide"),
  body("poster_url")
    .optional()
    .isURL()
    .withMessage("URL du poster invalide"),
  body("ai_tools_used")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Les outils IA ne doivent pas depasser 1000 caracteres"),
  body("ai_certification")
    .optional()
    .isBoolean()
    .withMessage("La certification IA doit etre un booleen"),

  // Director Information
  body("director_firstname")
    .trim()
    .notEmpty()
    .withMessage("Le prenom du realisateur est requis")
    .isLength({ max: 100 })
    .withMessage("Le prenom ne doit pas depasser 100 caracteres"),
  body("director_lastname")
    .trim()
    .notEmpty()
    .withMessage("Le nom du realisateur est requis")
    .isLength({ max: 100 })
    .withMessage("Le nom ne doit pas depasser 100 caracteres"),
  body("director_email")
    .isEmail()
    .withMessage("Email invalide")
    .normalizeEmail(),
  body("director_bio")
    .optional()
    .isLength({ max: 2000 })
    .withMessage("La bio ne doit pas depasser 2000 caracteres"),
  body("director_school")
    .optional()
    .isLength({ max: 255 })
    .withMessage("L'ecole/collectif ne doit pas depasser 255 caracteres"),
  body("director_website")
    .optional()
    .isURL()
    .withMessage("URL du site web invalide"),
  body("social_instagram")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Instagram ne doit pas depasser 255 caracteres"),
  body("social_youtube")
    .optional()
    .isLength({ max: 255 })
    .withMessage("YouTube ne doit pas depasser 255 caracteres"),
  body("social_vimeo")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Vimeo ne doit pas depasser 255 caracteres"),
];

// ============================================
// PUBLIC ROUTES (no authentication required)
// ============================================

/**
 * @route   POST /api/films/submit
 * @desc    Submit a new film with file uploads
 * @access  Public
 */
const filmUpload = uploadFilm.fields([
  { name: "film", maxCount: 1 },
  { name: "poster", maxCount: 1 },
]);

router.post("/submit", filmUpload, submitValidation, submitFilm);

/**
 * @route   GET /api/films/catalog
 * @desc    Get all approved films (public catalog)
 * @access  Public
 */
router.get("/catalog", getApprovedFilms);

/**
 * @route   GET /api/films/status
 * @desc    Check submission status by email
 * @access  Public
 */
router.get("/status", checkSubmissionStatus);

// ============================================
// PROTECTED ROUTES (Jury and Admin only)
// ============================================

/**
 * @route   GET /api/films
 * @desc    Get all films (with optional status filter)
 * @access  Jury, Admin
 */
router.get(
  "/",
  authenticateToken,
  authorize([1, 2]),
  getAllFilms
);

/**
 * @route   GET /api/films/pending
 * @desc    Get all pending films
 * @access  Jury, Admin
 */
router.get(
  "/pending",
  authenticateToken,
  authorize([1, 2]),
  getPendingFilms
);

/**
 * @route   GET /api/films/stats
 * @desc    Get film statistics
 * @access  Jury, Admin
 */
router.get(
  "/stats",
  authenticateToken,
  authorize([1, 2]),
  getFilmStats
);

/**
 * @route   GET /api/films/:id
 * @desc    Get a single film by ID
 * @access  Jury, Admin
 */
router.get(
  "/:id",
  authenticateToken,
  authorize([1, 2]),
  getFilmById
);

/**
 * @route   POST /api/films/:id/approve
 * @desc    Approve a film
 * @access  Jury, Admin
 */
router.post(
  "/:id/approve",
  authenticateToken,
  authorize([1, 2]),
  approveFilm
);

/**
 * @route   POST /api/films/:id/reject
 * @desc    Reject a film
 * @access  Jury, Admin
 */
router.post(
  "/:id/reject",
  authenticateToken,
  authorize([1, 2]),
  rejectFilm
);

/**
 * @route   DELETE /api/films/:id
 * @desc    Delete a film
 * @access  Admin only
 */
router.delete(
  "/:id",
  authenticateToken,
  authorize([2]),
  deleteFilm
);

export default router;
