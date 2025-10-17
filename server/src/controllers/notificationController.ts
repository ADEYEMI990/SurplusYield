import { Request, Response } from "express";
import { Notification } from "../models/Notification";

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    await Notification.updateMany({ user: userId, read: false }, { read: true });
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Failed to mark all as read" });
  }
};