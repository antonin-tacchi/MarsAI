import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import {
  getOverviewStats,
  getStatsByCountry,
  getStatsByCategory,
  getAIUsageStats,
  getSubmissionTimeline,
  getTopRatedFilms,
  getJuryActivityStats,
  getAllStats,
} from "../controllers/stats.controller.js";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// All routes require Admin (2) or Super Jury (3) role
router.use(authorize([2, 3]));

/**
 * @route   GET /api/admin/stats/overview
 * @desc    Get overview statistics (total films, by status, votes, AI usage)
 * @access  Admin, Super Jury
 */
router.get("/overview", getOverviewStats);

/**
 * @route   GET /api/admin/stats/by-country
 * @desc    Get film distribution by country
 * @access  Admin, Super Jury
 */
router.get("/by-country", getStatsByCountry);

/**
 * @route   GET /api/admin/stats/by-category
 * @desc    Get film distribution by category
 * @access  Admin, Super Jury
 */
router.get("/by-category", getStatsByCategory);

/**
 * @route   GET /api/admin/stats/ai-usage
 * @desc    Get AI usage statistics
 * @access  Admin, Super Jury
 */
router.get("/ai-usage", getAIUsageStats);

/**
 * @route   GET /api/admin/stats/timeline
 * @desc    Get submission timeline (films per month)
 * @query   months - Number of months to look back (default 6, max 24)
 * @access  Admin, Super Jury
 */
router.get("/timeline", getSubmissionTimeline);

/**
 * @route   GET /api/admin/stats/top-rated
 * @desc    Get top rated films by jury ratings
 * @query   limit - Number of films to return (default 10, max 50)
 * @access  Admin, Super Jury
 */
router.get("/top-rated", getTopRatedFilms);

/**
 * @route   GET /api/admin/stats/jury-activity
 * @desc    Get jury activity statistics
 * @access  Admin, Super Jury
 */
router.get("/jury-activity", getJuryActivityStats);

/**
 * @route   GET /api/admin/stats/all
 * @desc    Get all statistics in one call (dashboard overview)
 * @access  Admin, Super Jury
 */
router.get("/all", getAllStats);

export default router;