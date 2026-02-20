import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAdminFilms,
  updateFilmStatusAdmin,
  deleteFilm,
} from "../controllers/admin.controller.js";
import {
  getDistributionStats,
  previewDistribution,
  generateDistribution,
} from "../controllers/superjury.controller.js";
import {
  updatePageContent,
} from "../controllers/sitepage.controller.js";

const router = Router();

// Super Jury / Admin only (role 2, 3)
router.use(authenticateToken);
router.use(authorize([2, 3]));

// ─── USERS CRUD ─────────────────────────────────────────────
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// ─── FILMS MANAGEMENT ───────────────────────────────────────
router.get("/films", getAdminFilms);
router.patch("/films/:id/status", updateFilmStatusAdmin);
router.delete("/films/:id", deleteFilm);

// ─── DISTRIBUTION (Super Jury) ──────────────────────────────
router.get("/distribution/stats", getDistributionStats);
router.post("/distribution/preview", previewDistribution);
router.post("/distribution/generate", generateDistribution);

// ─── CMS / SITE CONTENT (Admin) ─────────────────────────
router.put("/pages/:slug", updatePageContent);

export default router;
