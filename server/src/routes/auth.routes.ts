import express from "express";
import { registerUser, loginUser, registerAdmin, loginAdmin, getProfile } from "../controllers/auth.controller";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/register-admin", protect, admin, registerAdmin);
router.post("/login", loginUser);
router.post("/login-admin", loginAdmin);
router.get("/profile", protect, getProfile);

// Example: only admin can hit this
router.get("/admin-only", protect, admin, (req, res) => {
  res.json({ message: "Hello Admin" });
});

export default router;