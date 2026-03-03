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
  getPendingRefusals,
  validateRefusal,
} from "../controllers/admin.controller.js";
import {
  getDistributionStats,
  previewDistribution,
  generateDistribution,
} from "../controllers/superjury.controller.js";
import {
  getAllLists,
  getListById,
  createList,
  updateList,
  deleteList,
  addFilmsToList,
  removeFilmsFromList,
  assignListToJuries,
  removeJuriesFromList,
} from "../controllers/jurylist.controller.js";
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

// ─── JURY LISTS (Super Jury) ─────────────────────────────
router.get("/lists", getAllLists);
router.get("/lists/:id", getListById);
router.post("/lists", createList);
router.put("/lists/:id", updateList);
router.delete("/lists/:id", deleteList);
router.post("/lists/:id/films", addFilmsToList);
router.delete("/lists/:id/films", removeFilmsFromList);
router.post("/lists/:id/assign", assignListToJuries);
router.delete("/lists/:id/assign", removeJuriesFromList);

// ─── JURY REFUSALS ──────────────────────────────────────────
router.get("/refusals", getPendingRefusals);
router.patch("/refusals/:id/validate", validateRefusal);

// ─── CMS / SITE CONTENT (Admin) ─────────────────────────
router.put("/pages/:slug", updatePageContent);

export default router;
