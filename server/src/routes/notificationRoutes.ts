import express from "express";
import { protect } from "../middleware/authMiddleware";
import { getUserNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController";

const router = express.Router();

router.get("/", protect, getUserNotifications);
router.patch("/:id/read", protect, markAsRead);
router.patch("/mark-all", protect, markAllAsRead);

export default router;
