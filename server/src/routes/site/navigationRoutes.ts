import { Router } from "express";
import { createNavItem, getNavItems, updateNavItem, deleteNavItem } from "../../controllers/site/navigationController";
import { protect, admin } from "../../middleware/authMiddleware";

const router = Router();

router.post("/", protect, admin, createNavItem);
router.get("/", getNavItems);
router.put("/:id", protect, admin, updateNavItem);
router.delete("/:id", protect, admin, deleteNavItem);

export default router;
