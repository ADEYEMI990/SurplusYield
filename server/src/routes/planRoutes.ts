// server/src/routes/planRoutes.ts
import express from "express";
import { createPlan, getPlans, getPlanById, togglePlanStatus, updatePlan, deletePlan } from "../controllers/planController";
import { protect, admin } from "../middleware/authMiddleware";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/", getPlans); // public
router.get("/:id", protect, admin, getPlanById);
router.post("/", protect, admin, upload.single("icon"), createPlan);
router.put("/:id/toggle", togglePlanStatus);
router.put("/:id", protect, admin, upload.single("icon"), updatePlan);
router.delete("/:id", protect, admin, deletePlan);

export default router;
