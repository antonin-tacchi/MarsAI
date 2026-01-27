import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import rateLimit from "express-rate-limit";
import { createFilm } from "../controllers/film.controller.js";

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
      `${file.fieldname}_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const imageOk = ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
    file.mimetype
  );
  const filmOk = ["video/mp4", "video/webm", "video/quicktime"].includes(
    file.mimetype
  );

  if (file.fieldname === "poster" && imageOk) return cb(null, true);
  if (file.fieldname === "thumbnail" && imageOk) return cb(null, true);
  if (file.fieldname === "film" && filmOk) return cb(null, true);

  return cb(new Error("INVALID_FILE_TYPE"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 800 * 1024 * 1024,
  },
});

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
