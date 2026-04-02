import { Response } from "express";
import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma";

export const getAllReferrals = asyncHandler(async (req: any, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    // For each user, fetch the referring user's email if referredBy is set
    const usersWithReferrer = await Promise.all(users.map(async (user) => {
      let referrerEmail = null;
      if (user.referredBy) {
        const refUser = await prisma.user.findUnique({ where: { id: user.referredBy } });
        referrerEmail = refUser ? refUser.email : null;
      }
      return {
        ...user,
        referrerEmail,
      };
    }));
    res.json(usersWithReferrer);
    return;
  } catch {
    res.status(500).json({ message: "Error fetching referrals" });
    return;
  }
});
