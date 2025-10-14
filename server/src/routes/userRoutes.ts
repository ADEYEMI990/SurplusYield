// server/src/routes/userRoutes.ts
import express from "express";
import { protect } from "../middleware/authMiddleware";
import { getReferralDepositStatus } from "../controllers/userController";

const router = express.Router();

// ✅ Protected route
router.get("/referral-status", protect, getReferralDepositStatus);

export default router;
