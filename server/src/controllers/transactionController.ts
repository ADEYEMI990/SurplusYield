// server/src/controllers/transactionController.ts
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Transaction } from "../models/Transaction";

// Create transaction (User)
export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  try {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const { type, amount, plan } = req.body;

  if (!type || !amount) {
    res.status(400);
    throw new Error("Please provide type and amount");
  }

  const transaction = await Transaction.create({
    user: req.user._id, // ✅ typed now
    type,
    amount,
    plan,
    status: "pending",
  });

  res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: "Error creating transaction", error });
  }
});

// Get user transactions
export const getUserTransactions = asyncHandler(async (req: Request, res: Response) => {
  try {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 });

  res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

// Get all transactions (Admin only)
export const getAllTransactions = asyncHandler(async (req: Request, res: Response) => {
  try {
  const transactions = await Transaction.find()
    .populate("user", "name email role")
    .sort({ createdAt: -1 });

  res.json(transactions); 
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

export const updateTransactionStatus = asyncHandler(async (req: Request, res: Response) => {
  try {
  const { id } = req.params;
  const { status } = req.body;

  const transaction = await Transaction.findById(id);

  if (!transaction) {
    res.status(404);
    throw new Error("Transaction not found");
  }

  transaction.status = status || transaction.status;

  const updatedTransaction = await transaction.save();

  res.json(updatedTransaction);
  } catch {
    res.status(500).json({ message: "Error updating transaction" });
  }
});