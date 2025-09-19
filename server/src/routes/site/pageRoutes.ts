import { Router } from "express";
import { createPage, getPages, getPageBySlug, updatePage, deletePage } from "../../controllers/site/pageController";
import { protect, admin } from "../../middleware/authMiddleware";

const router = Router();

router.post("/", protect, admin, createPage);
router.get("/", getPages);
router.get("/:slug", getPageBySlug);
router.put("/:id", protect, admin, updatePage);
router.delete("/:id", protect, admin, deletePage);

export default router;
