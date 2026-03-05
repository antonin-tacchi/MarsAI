import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorize.middleware.js';
import * as juryController from '../controllers/juryMember.controller.js';

const router = express.Router();

// Stockage en mémoire : le buffer est transmis directement à Scaleway
const uploadJuryPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const valid = allowedTypes.test(file.mimetype);
    if (valid) return cb(null, true);
    cb(new Error('Format de fichier non autorisé. Utilisez : jpg, jpeg, png, webp'));
  },
});

// ============================================================
// Routes PUBLIQUES
// ============================================================
router.get('/jury-members', juryController.getAllJuryMembers);
router.get('/jury-members/:id', juryController.getJuryMemberById);

// ============================================================
// Routes ADMIN (role_id = 2)
// ============================================================
router.put(
  '/jury-members/:id/profile',
  authenticateToken,
  authorize([2]),
  uploadJuryPhoto.single('profile_picture'),
  juryController.updateJuryProfile
);

router.get(
  '/jury-members-stats',
  authenticateToken,
  authorize([2]),
  juryController.getJuryStats
);

// ============================================================
// Gestion des erreurs Multer
// ============================================================
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'La photo est trop volumineuse. Maximum 5 MB.' });
    }
    return res.status(400).json({ success: false, message: `Erreur upload: ${error.message}` });
  }
  if (error) return res.status(400).json({ success: false, message: error.message });
  next();
});

export default router;