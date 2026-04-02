// server/src/routes/adminSettingRoutes.ts

import express from "express";
import { getAllSettings, upsertSetting } from "../controllers/adminSettingController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, admin, getAllSettings);
router.post("/", protect, admin, upsertSetting);

export default router;
