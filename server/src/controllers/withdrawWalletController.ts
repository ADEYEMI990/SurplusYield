import { Request, Response } from "express";
import WithdrawWallet from "../models/WithdrawWallet";

// 🟢 User saves or updates their BTC address
export const saveWithdrawWallet = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userId = req.user._id; // assume you have auth middleware
    const { btcAddress } = req.body;

    if (!btcAddress) return res.status(400).json({ message: "BTC address is required" });

    let wallet = await WithdrawWallet.findOne({ userId });
    if (wallet) {
      wallet.btcAddress = btcAddress;
      await wallet.save();
    } else {
      wallet = await WithdrawWallet.create({ userId, btcAddress });
    }

    res.json({ message: "BTC address saved successfully", wallet });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Admin: Get all withdrawal wallets
export const getAllWithdrawWallets = async (req: Request, res: Response) => {
  try {
    const wallets = await WithdrawWallet.find().populate("userId", "name email");
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
