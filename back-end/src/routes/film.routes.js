import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import rateLimit from "express-rate-limit";
import { createFilm, updateFilmStatus } from "../controllers/film.controller.js";

const router = express.Router();

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions. Please try again later.",
  },
});

const postersDir = path.resolve(process.cwd(), "uploads", "posters");
const filmsDir = path.resolve(process.cwd(), "uploads", "films");
const thumbnailsDir = path.resolve(process.cwd(), "uploads", "thumbnails");

fs.mkdirSync(postersDir, { recursive: true });
fs.mkdirSync(filmsDir, { recursive: true });
fs.mkdirSync(thumbnailsDir, { recursive: true });

export const MAX_POSTER_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_THUMBNAIL_SIZE = 3 * 1024 * 1024; // 3MB
export const MAX_FILM_SIZE = 800 * 1024 * 1024; // 800MB

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
        .slice(2)}${ext}`
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
          message: "File too large",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Upload error",
      });
    }

    const code = String(err.message || "UPLOAD_ERROR");
    const map = {
      INVALID_IMAGE_TYPE: "Invalid image type (poster/thumbnail). Allowed: jpg, jpeg, png, webp",
      INVALID_VIDEO_TYPE: "Invalid video type (film). Allowed: mp4, webm, mov",
      UNEXPECTED_FIELD: "Unexpected upload field",
      UPLOAD_ERROR: "Invalid file upload",
    };

    return res.status(400).json({
      success: false,
      message: map[code] || map.UPLOAD_ERROR,
    });
  });
};

router.post("/", submitLimiter, uploadMiddleware, createFilm);

router.patch("/films/:id/status", updateFilmStatus);

export default router;
