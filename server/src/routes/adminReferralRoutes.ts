// server/src/routes/adminReferralRoutes.ts

import express from "express";
import { getAllReferrals } from "../controllers/adminReferralController";
import { protect, admin } from "../middleware/authMiddleware";


const router = express.Router();
router.get("/", protect, admin, getAllReferrals);

export default router;