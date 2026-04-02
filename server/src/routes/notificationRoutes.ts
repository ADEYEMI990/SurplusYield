
import express from "express";
import { protect } from "../middleware/authMiddleware";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../controllers/notificationController";


const router = express.Router();
router.get("/", protect, getNotifications);
router.patch("/:id/read", protect, markNotificationRead);
router.patch("/mark-all", protect, markAllNotificationsRead);

export default router;
