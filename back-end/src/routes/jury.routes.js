import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import {
  getJuryFilms,
  getFilmDetails,
  rateFilm,
  getJuryMembers,
  getFilmRankings,
  getUserRatings,
} from "../controllers/jury.controller.js";

const router = Router();

// All jury routes require authentication
router.use(authenticateToken);

// ============ JURY ROUTES (role 1, 3) ============
// Jury (1) and Super Jury (3) can access these

// Get all approved films for rating
router.get("/films", authorize([1, 3]), getJuryFilms);

// Get single film with details and ratings
router.get("/films/:id", authorize([1, 3]), getFilmDetails);

// Rate a film (1-5 stars)
router.post("/films/:id/rate", authorize([1, 3]), rateFilm);

// Get user's own ratings
router.get("/my-ratings", authorize([1, 3]), getUserRatings);

// ============ SUPER JURY / ADMIN ROUTES (role 2, 3) ============

// Get all jury members (for assignment management)
router.get("/members", authorize([2, 3]), getJuryMembers);

// Get film rankings (minimum 3 ratings required)
router.get("/rankings", authorize([2, 3]), getFilmRankings);

export default router;
