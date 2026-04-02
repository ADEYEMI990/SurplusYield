// Utility to send notifications to users
import prisma from "../lib/prisma";

export const sendNotification = async (
  userId: string,
  title: string,
  message: string,
  type: "investment" | "transaction" | "kyc" | "security" | "system" = "system"
) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  } catch (err) {
    console.error("❌ Failed to create notification:", err);
  }
};
