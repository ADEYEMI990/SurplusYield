// server/src/routes/adminRoutes.ts
import express from "express";
import { getAdminStats } from "../controllers/adminController";
import { admin } from "../middleware/authMiddleware";

const router = express.Router();
router.get("/stats", admin, getAdminStats);
export default router;
