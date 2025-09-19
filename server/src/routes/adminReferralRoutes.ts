// server/src/routes/adminReferralRoutes.ts
import express from "express";
import { getReferralTree } from "../controllers/adminReferralController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, admin, getReferralTree);

export default router;