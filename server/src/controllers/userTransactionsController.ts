// server/src/controllers/userTransactionsController.ts
import { Response } from "express";
import { Transaction } from "../models/Transaction";

export const getUserTransactions = async (req: any, res: Response) => {
  try {
    const txns = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(txns);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
};
