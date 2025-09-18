// server/src/routes/planRoutes.ts
import express from "express";
import { createPlan, getPlans, updatePlan, deletePlan } from "../controllers/planController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getPlans); // public
router.post("/", protect, admin, createPlan);
router.put("/:id", protect, admin, updatePlan);
router.delete("/:id", protect, admin, deletePlan);

export default router;
