// server/src/controllers/walletController.ts
import { Response } from "express";
import Wallet from "../models/Wallet";
import { Transaction } from "../models/Transaction";

export const getWallet = async (req: any, res: Response) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id }).populate("transactions");
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    res.json(wallet);
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ message: "Error fetching wallet" });
  }
};

export const deposit = async (req: any, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid deposit amount" });
    }

    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id, balance: 0 });
    }

    wallet.balance += amount;
    await wallet.save();

    await Transaction.create({
      user: req.user._id,
      type: "deposit",
      amount,
      status: "completed",
    });
    
    res.json({ message: "Deposit successful", balance: wallet.balance });
  } catch (error) {
    console.error("Deposit error:", error);
    res.status(500).json({ message: "Error processing deposit" });
  }
};

export const withdraw = async (req: any, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid withdraw amount" });
    }

    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    wallet.balance -= amount;
    await wallet.save();

    await Transaction.create({
      user: req.user._id,
      type: "withdraw",
      amount,
      status: "pending", // require admin approval
    });

    res.json({ message: "Withdrawal request submitted", balance: wallet.balance });
  } catch (error) {
    console.error("Withdraw error:", error);
    res.status(500).json({ message: "Error processing withdrawal" });
  }
};
