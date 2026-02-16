import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
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

const postersDir = path.resolve(process.cwd(), "uploads", "posters");
const filmsDir = path.resolve(process.cwd(), "uploads", "films");
const thumbnailsDir = path.resolve(process.cwd(), "uploads", "thumbnails");

fs.mkdirSync(postersDir, { recursive: true });
fs.mkdirSync(filmsDir, { recursive: true });
fs.mkdirSync(thumbnailsDir, { recursive: true });

export const MAX_POSTER_SIZE = 5 * 1024 * 1024;
export const MAX_THUMBNAIL_SIZE = 3 * 1024 * 1024;
export const MAX_FILM_SIZE = 800 * 1024 * 1024;

const IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_MIME = ["video/mp4", "video/webm", "video/quicktime"];

const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp"];
const VIDEO_EXT = [".mp4", ".webm", ".mov"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "poster") return cb(null, postersDir);
    if (file.fieldname === "film") return cb(null, filmsDir);
    if (file.fieldname === "thumbnail") return cb(null, thumbnailsDir);
    return cb(new Error("UNEXPECTED_FIELD"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(
      null,
      `${file.fieldname}_${Date.now()}_${Math.random()
        .toString(16)
        .slice(2)}${ext}`,
    );
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();

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

const uploadMiddleware = (req, res, next) => {
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "film", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ])(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Fichier trop volumineux",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Erreur lors de l'upload",
      });
    }

    const code = String(err.message || "UPLOAD_ERROR");
    const map = {
      INVALID_IMAGE_TYPE:
        "Type d'image invalide (poster/thumbnail). Autorisés : jpg, jpeg, png, webp",
      INVALID_VIDEO_TYPE: "Type de vidéo invalide (film). Autorisés : mp4, webm, mov",
      UNEXPECTED_FIELD: "Champ d'upload inattendu",
      UPLOAD_ERROR: "Erreur lors de l'upload du fichier",
    };

    return res.status(400).json({
      success: false,
      message: map[code] || map.UPLOAD_ERROR,
    });
  });
};

// Public routes (no auth)
router.get("/public/catalog", getPublicCatalog);
router.get("/public/:id", getPublicFilm);

// PATCH : mise à jour du statut d’un film (authentifié + autorisation)
router.patch(
  "/:id/status",
  authenticateToken,
  authorize([1, 2, 3]), //Jury (1), Admin (2), Super Jury (3)
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
  createFilm,
);

export default router;
