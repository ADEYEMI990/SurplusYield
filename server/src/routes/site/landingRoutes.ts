import { Router } from "express";
import { createSection, getSections, updateSection } from "../../controllers/site/landingController";
import { protect, admin } from "../../middleware/authMiddleware";

const router = Router();

router.post("/", protect, admin, createSection);
router.get("/", getSections);
router.put("/:id", protect, admin, updateSection);

export default router;
