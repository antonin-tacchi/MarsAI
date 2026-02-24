import express from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";
import {
  createFilm,
  updateFilmStatus,
  getFilms,
  getFilmById,
  getFilmStats,
  getPublicCatalog,
  getPublicFilm,
  getPublicRanking,
} from "../controllers/film.controller.js";

const router = express.Router();

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Trop de soumissions. Veuillez réessayer plus tard.",
  },
});

export const MAX_POSTER_SIZE = 5 * 1024 * 1024;
export const MAX_THUMBNAIL_SIZE = 3 * 1024 * 1024;
export const MAX_FILM_SIZE = 800 * 1024 * 1024;

const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_MIME = ["video/mp4", "video/webm", "video/quicktime"];

const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const VIDEO_EXT = [".mp4", ".webm", ".mov"];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = (file.originalname || "").toLowerCase().slice(((file.originalname || "").lastIndexOf(".")) >>> 0);

  if (file.fieldname === "poster" || file.fieldname === "thumbnail") {
    const ok = IMAGE_MIME.includes(file.mimetype) && IMAGE_EXT.includes(ext);
    if (!ok) return cb(new Error("INVALID_IMAGE_TYPE"));
    return cb(null, true);
  }

  if (file.fieldname === "film") {
    const ok = VIDEO_MIME.includes(file.mimetype) && VIDEO_EXT.includes(ext);
    if (!ok) return cb(new Error("INVALID_VIDEO_TYPE"));
    return cb(null, true);
  }

  return cb(new Error("UNEXPECTED_FIELD"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILM_SIZE,
  },
});

// Public routes
router.get("/public/catalog", getPublicCatalog);
router.get("/public/:id", getPublicFilm);
router.get("/ranking", getPublicRanking);

router.patch(
  "/:id/status",
  authenticateToken,
  authorize([1, 2, 3]),
  updateFilmStatus
);

// Regular routes
router.get("/", getFilms);
router.get("/stats", getFilmStats);
router.get("/:id", getFilmById);

router.post(
  "/",
  submitLimiter,
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "film", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createFilm
);

export default router;