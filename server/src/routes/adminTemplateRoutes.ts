// server/src/routes/adminTemplateRoutes.ts
import express from "express";
import { createTemplate, getAllTemplates } from "../controllers/adminTemplateController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, admin, createTemplate);
router.get("/", protect, admin, getAllTemplates);

export default router;
