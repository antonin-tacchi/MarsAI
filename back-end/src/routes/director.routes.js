import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = Router();

// Director(1) + Admin(3)
router.use(authenticateToken);
router.use(authorize([1, 3]));

//test
router.get("/access", (req, res) => {
  res.json({ success: true, zone: "director", user: req.user });
});

export default router;
