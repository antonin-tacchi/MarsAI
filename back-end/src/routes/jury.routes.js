import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import {
  getFilmsForJury,
  getFilmForJury,
  submitRating,
  getMyRatings,
  deleteRating,
  getAssignedFilmsForJury,
  getResults,
  refuseFilm,
  selectFilm,
} from "../controllers/jury.controller.js";
import { getMyLists } from "../controllers/jurylist.controller.js";

const router = Router();

// Jury(1) + Admin(2) + Super Jury(3)
router.use(authenticateToken);
router.use(authorize([1, 2, 3]));

// Test access
router.get("/access", (req, res) => {
  res.json({ success: true, zone: "jury", user: req.user });
});

// Get all films for jury to rate
router.get("/films", getFilmsForJury);

// Get single film with rating details
router.get("/films/:id", getFilmForJury);

// Submit or update a rating (0-10)
router.post("/films/:id/rate", submitRating);

// Get current user's rating history
router.get("/my-ratings", getMyRatings);

router.get("/lists", getMyLists);
router.get("/assigned-films", getAssignedFilmsForJury);

// Get film ranking / results
router.get("/results", getResults);

// Delete a rating
router.delete("/films/:id/rate", deleteRating);

// Refuse an assigned film
router.post("/films/:id/refuse", refuseFilm);

// Toggle film selection for catalog (approved ↔ selected)
router.patch("/films/:id/select", selectFilm);

export default router;
