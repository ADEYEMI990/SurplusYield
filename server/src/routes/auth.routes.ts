import express from "express";
import { registerUser, loginUser, registerAdmin, getProfile } from "../controllers/auth.controller";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/register-admin", registerAdmin);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);

// Example: only admin can hit this
router.get("/admin-only", protect, admin, (req, res) => {
  res.json({ message: "Hello Admin" });
});

export default router;