// server/src/controllers/transactionController.ts
import { Request, Response } from "express";
import { Transaction } from "../models/Transaction";

// Create transaction (User)
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const tx = new Transaction(req.body);
    await tx.save();
    res.status(201).json(tx);
  } catch (error) {
    res.status(400).json({ message: "Error creating transaction", error });
  }
};

// Get user transactions
export const getUserTransactions = async (req: any, res: Response) => {
  try {
    const txs = await Transaction.find({ user: req.user._id }).populate("plan");
    res.json(txs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

// Get all transactions (Admin only)
export const getAllTransactions = async (_: Request, res: Response) => {
  try {
    const txs = await Transaction.find().populate("user plan");
    res.json(txs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

export const updateTransactionStatus = async (req: Request, res: Response) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    tx.status = req.body.status; // "completed" | "failed"
    await tx.save();

    res.json({ message: `Transaction ${tx.status}`, tx });
  } catch {
    res.status(500).json({ message: "Error updating transaction" });
  }
};