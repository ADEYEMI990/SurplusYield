// src/routes/site/footerRoutes.ts
import { Router } from "express";
import { createFooterSection, getFooterSections, updateFooterSection, deleteFooterSection } from "../../controllers/site/footerController";
import { protect, admin } from "../../middleware/authMiddleware";

const router = Router();

router.post("/", protect, admin, createFooterSection);
router.get("/", getFooterSections);
router.put("/:id", protect, admin, updateFooterSection);
router.delete("/:id", protect, admin, deleteFooterSection);

export default router;
