// Utility to send notifications to users
import { Notification } from "../models/Notification";

export const sendNotification = async (
  userId: string,
  title: string,
  message: string,
  type: "investment" | "transaction" | "kyc" | "security" | "system" = "system"
) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type,
    });
  } catch (err) {
    console.error("❌ Failed to create notification:", err);
  }
};
