import { Response } from "express";
import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma";

// 🟢 User saves or updates their BTC address
export const saveOrUpdateBTCAddress = asyncHandler(async (req: any, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const userId = req.user.id; // Prisma uses string IDs
    const { btcAddress } = req.body;

    if (!btcAddress) {
      res.status(400).json({ message: "BTC address is required" });
      return;
    }

    let wallet = await prisma.withdrawWallet.findUnique({ where: { userId } });
    if (wallet) {
      wallet = await prisma.withdrawWallet.update({
        where: { userId },
        data: { btcAddress },
      });
    } else {
      wallet = await prisma.withdrawWallet.create({
        data: { userId, btcAddress },
      });
    }

    res.json({ message: "BTC address saved successfully", wallet });
    return;
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    return;
  }
});

// 🟢 Admin: Get all withdrawal wallets
export const getAllWithdrawWallets = asyncHandler(async (req: any, res: Response): Promise<void> => {
  try {
    const wallets = await prisma.withdrawWallet.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });
    res.json(wallets);
    return;
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    return;
  }
});
