import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = Router();

// Jury(1) + Admin(2) + SuperJury (3)
router.use(authenticateToken);
router.use(authorize([1, 2, 3]));

//test
router.get("/access", (req, res) => {
  res.json({ success: true, zone: "jury", user: req.user });
});

export default router;
