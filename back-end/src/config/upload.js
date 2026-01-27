import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

// Ensure uploads directories exist
const filmsDir = path.join(process.cwd(), "uploads", "films");
const postersDir = path.join(process.cwd(), "uploads", "posters");
const thumbnailsDir = path.join(process.cwd(), "uploads", "thumbnails");

if (!fs.existsSync(filmsDir)) {
  fs.mkdirSync(filmsDir, { recursive: true });
}
if (!fs.existsSync(postersDir)) {
  fs.mkdirSync(postersDir, { recursive: true });
}
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Configure storage for film, poster and thumbnail uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "film") {
      cb(null, filmsDir);
    } else if (file.fieldname === "poster") {
      cb(null, postersDir);
    } else if (file.fieldname === "thumbnail") {
      cb(null, thumbnailsDir);
    } else {
      cb(new Error("Champ de fichier inconnu"), false);
    }
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    let prefix = "file";
    if (file.fieldname === "film") prefix = "film";
    else if (file.fieldname === "poster") prefix = "poster";
    else if (file.fieldname === "thumbnail") prefix = "thumb";
    cb(null, `${prefix}_${uniqueId}${ext}`);
  },
});

// File filter - accept video files for film, images for poster
const fileFilter = (req, file, cb) => {
  const videoMimes = [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
    "video/webm",
    "video/mpeg",
    "video/x-matroska",
  ];

  const imageMimes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (file.fieldname === "film") {
    if (videoMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Format de video non supporte. Utilisez MP4, MOV, AVI, WMV, WebM, MPEG ou MKV."), false);
    }
  } else if (file.fieldname === "poster" || file.fieldname === "thumbnail") {
    if (imageMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Format d'image non supporte. Utilisez JPG, PNG, WebP ou GIF."), false);
    }
  } else {
    cb(new Error("Champ de fichier inconnu"), false);
  }
};

// Multer upload configuration for film submissions
const uploadFilm = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2GB max for videos
  },
});

// Separate poster-only upload for other use cases
const posterOnlyStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, postersDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `poster_${uniqueId}${ext}`);
  },
});

const posterOnlyFilter = (req, file, cb) => {
  const imageMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (imageMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format d'image non supporte. Utilisez JPG, PNG, WebP ou GIF."), false);
  }
};

const uploadPoster = multer({
  storage: posterOnlyStorage,
  fileFilter: posterOnlyFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

export { uploadFilm, uploadPoster };
