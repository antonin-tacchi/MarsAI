import express from "express";
import { getAllPartners, getPartnerById, createPartner, updatePartner, deletePartner } from "../controllers/partners.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = express.Router();

router.get("/", getAllPartners);
router.get("/:id", getPartnerById);
router.post("/", authenticateToken, authorize([2]), createPartner);
router.put("/:id", authenticateToken, authorize([2]), updatePartner);
router.delete("/:id", authenticateToken, authorize([2]), deletePartner);

export default router;