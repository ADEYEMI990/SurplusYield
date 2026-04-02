// server/src/routes/planRoutes.ts

import express from "express";
import { createPlan, getAllPlans, getPlan, togglePlanStatus, updatePlan, deletePlan } from "../controllers/planController";
import { protect, admin } from "../middleware/authMiddleware";
import multer from "multer";
import { upload } from "../middleware/s3Upload";

const router = express.Router();

router.get("/", getAllPlans); // public
router.get("/:id", protect, admin, getPlan);
router.post("/", protect, admin, upload.single("icon"), createPlan);
router.put("/:id/toggle", togglePlanStatus);
router.put("/:id", protect, admin, upload.single("icon"), updatePlan);
router.delete("/:id", protect, admin, deletePlan);

export default router;
