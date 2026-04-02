import { Response } from "express";
import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma";

export const getNotifications = asyncHandler(async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json(notifications);
    return;
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications" });
    return;
  }
});

export const markNotificationRead = asyncHandler(async (req: any, res: Response): Promise<void> => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json({ success: true });
    return;
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as read" });
    return;
  }
});

export const markAllNotificationsRead = asyncHandler(async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    res.json({ success: true });
    return;
  } catch {
    res.status(500).json({ message: "Failed to mark all as read" });
    return;
  }
});