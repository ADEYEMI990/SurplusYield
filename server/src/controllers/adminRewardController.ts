import { Response } from "express";
import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma";

export const getAllRewards = asyncHandler(async (req: any, res: Response): Promise<void> => {
  try {
    const rewards = await prisma.reward.findMany({
      include: {
        user: { select: { email: true } },
      },
    });
    res.json(rewards);
    return;
  } catch {
    res.status(500).json({ message: "Error fetching rewards" });
    return;
  }
});