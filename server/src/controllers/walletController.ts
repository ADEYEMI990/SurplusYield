import { Response } from "express";
import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma";

// GET wallet address
export const getWallet = asyncHandler(async (req: any, res: Response): Promise<void> => {
  try {
    const wallet = await prisma.wallet.findFirst();
    if (!wallet) {
      res.status(404).json({ message: "Wallet not found" });
      return;
    }
    res.json(wallet);
    return;
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    return;
  }
});

// UPDATE or CREATE wallet address
export const updateOrCreateWallet = asyncHandler(async (req: any, res: Response): Promise<void> => {
  try {
    const { address } = req.body;
    if (!address) {
      res.status(400).json({ message: "Address is required" });
      return;
    }

    let wallet = await prisma.wallet.findFirst();
    if (wallet) {
      wallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { address },
      });
    } else {
      wallet = await prisma.wallet.create({ data: { address } });
    }

    res.json({ message: "Wallet updated successfully", wallet });
    return;
  } catch (err) {
    res.status(500).json({ message: "Server error" });
    return;
  }
});
