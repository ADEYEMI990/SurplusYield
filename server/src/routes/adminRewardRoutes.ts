// server/src/routes/adminRewardRoutes.ts
import express from "express";
import { getAllRewards } from "../controllers/adminRewardController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, admin, getAllRewards);

export default router;
