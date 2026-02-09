import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import {
  validateCreateRating,
  validateUpdateRating,
  validateGetRatingsByFilm,
  validateGetRatingById,
} from "../validators/ratingValidator.js";
import {
  createRating,
  updateRating,
  getRatingsByFilm,
  getMyRatings,
  getRatingById,
  deleteRating,
  getFilmStats,
} from "../controllers/rating.controller.js";

const router = Router();

router.use(authenticateToken);

router.use(authorize([1, 2, 3]));

/**
 * @route   POST /api/ratings
 * @desc    Create a new rating for a film
 * @access  Jury, Admin, Super Jury
 */
router.post("/", validateCreateRating, createRating);

/**
 * @route   PUT /api/ratings/:id
 * @desc    Update an existing rating
 * @access  Jury, Admin, Super Jury (only own ratings)
 */
router.put("/:id", validateUpdateRating, updateRating);

/**
 * @route   GET /api/ratings/my-ratings
 * @desc    Get all ratings by the authenticated user
 * @access  Jury, Admin, Super Jury
 */
router.get("/my-ratings", getMyRatings);

/**
 * @route   GET /api/ratings/film/:filmId
 * @desc    Get all ratings for a specific film
 * @access  Jury, Admin, Super Jury
 */
router.get("/film/:filmId", validateGetRatingsByFilm, getRatingsByFilm);

/**
 * @route   GET /api/ratings/stats/:filmId
 * @desc    Get rating statistics for a film
 * @access  Jury, Admin, Super Jury
 */
router.get("/stats/:filmId", validateGetRatingsByFilm, getFilmStats);

/**
 * @route   GET /api/ratings/:id
 * @desc    Get a single rating by ID
 * @access  Jury, Admin, Super Jury
 */
router.get("/:id", validateGetRatingById, getRatingById);

/**
 * @route   DELETE /api/ratings/:id
 * @desc    Delete a rating (only own ratings)
 * @access  Jury, Admin, Super Jury
 */
router.delete("/:id", deleteRating);

export default router;
