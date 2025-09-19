// server/src/routes/adminSettingRoutes.ts
import express from "express";
import { getAllSettings, updateSetting } from "../controllers/adminSettingController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", protect, admin, getAllSettings);
router.post("/", protect, admin, updateSetting);

export default router;
