import { Request, Response } from "express";
import Wallet from "../models/Wallet";

// GET wallet address
export const getWallet = async (req: Request, res: Response) => {
  try {
    const wallet = await Wallet.findOne();
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    res.json(wallet);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE or CREATE wallet address
export const updateWallet = async (req: Request, res: Response) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ message: "Address is required" });

    let wallet = await Wallet.findOne();
    if (wallet) {
      wallet.address = address;
      await wallet.save();
    } else {
      wallet = await Wallet.create({ address });
    }

    res.json({ message: "Wallet updated successfully", wallet });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
