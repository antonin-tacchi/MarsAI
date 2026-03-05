import express from "express";
import multer from "multer";
import {
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
} from "../controllers/partners.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = express.Router();

// Stockage en mémoire : le buffer est transmis directement à Scaleway
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|svg\+xml/;
    if (allowed.test(file.mimetype)) return cb(null, true);
    cb(new Error("Format non autorisé. Utilisez : jpg, jpeg, png, webp, svg"));
  },
});

router.get("/", getAllPartners);
router.get("/:id", getPartnerById);
router.post("/", authenticateToken, authorize([2]), upload.single("logo"), createPartner);
router.put("/:id", authenticateToken, authorize([2]), upload.single("logo"), updatePartner);
router.delete("/:id", authenticateToken, authorize([2]), deletePartner);

// Gestion des erreurs multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "Logo trop volumineux. Maximum 5 MB." });
    }
    return res.status(400).json({ success: false, message: `Erreur upload : ${error.message}` });
  }
  if (error) return res.status(400).json({ success: false, message: error.message });
  next();
});

export default router;