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
  previewRotationLists,
  generateRotationLists,
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

import { updatePageContent } from "../controllers/sitepage.controller.js";

const router = Router();

// Super Jury / Admin only (role 2, 3)
router.use(authenticateToken);
router.use(authorize([2, 3]));

// ─── USERS CRUD ─────────────────────────────────────────────
router.get("/users",       getAllUsers);
router.post("/users",      createUser);
router.put("/users/:id",   updateUser);
router.delete("/users/:id", deleteUser);

// ─── FILMS MANAGEMENT ───────────────────────────────────────
router.get("/films",              getAdminFilms);
router.patch("/films/:id/status", updateFilmStatusAdmin);
router.delete("/films/:id",       deleteFilm);

// ─── DISTRIBUTION (Super Jury) ──────────────────────────────
// Step 1: preview → returns previewToken + summary
// Step 2: super-jury reviews then calls generate with the token to confirm
router.get("/distribution/stats",     getDistributionStats);
router.post("/distribution/preview",  previewDistribution);
router.post("/distribution/generate", generateDistribution);

// ─── JURY LISTS (Super Jury) ─────────────────────────────────────────────────
// ⚠️  Static routes MUST come before /:id to avoid Express treating
//     "rotation" as a list id.

// Rotation (static sub-paths — declared FIRST)
router.post("/lists/rotation/preview",  previewRotationLists);
router.post("/lists/rotation/generate", generateRotationLists);

// CRUD on lists
router.get("/lists",          getAllLists);
router.post("/lists",         createList);
router.get("/lists/:id",      getListById);
router.put("/lists/:id",      updateList);
router.delete("/lists/:id",   deleteList);

// Films inside a list
router.post("/lists/:id/films",   addFilmsToList);
router.delete("/lists/:id/films", removeFilmsFromList);

// Jury assignments for a list
router.post("/lists/:id/assign",   assignListToJuries);
router.delete("/lists/:id/assign", removeJuriesFromList);

// ─── CMS / SITE CONTENT (Admin) ─────────────────────────────
router.put("/pages/:slug", updatePageContent);

export default router;