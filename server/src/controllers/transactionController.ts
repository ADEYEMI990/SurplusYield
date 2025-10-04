// server/src/controllers/transactionController.ts
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Transaction } from "../models/Transaction";
import { applyTransactionToWalletAtomic } from "../utils/walletUtils";
import mongoose from "mongoose";
import User from "../models/User";

// Create transaction (User)
export const createTransaction = asyncHandler(async (req: Request, res: Response) => {
  try {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const { type, amount, plan, bonusType } = req.body;

  if (type === "bonus" && !bonusType) {
    res.status(400);
    throw new Error("Bonus transactions must include bonusType");
  }

  if (!type || !amount) {
    res.status(400);
    throw new Error("Please provide type and amount");
  }

  const transaction = await Transaction.create({
    user: req.user._id, // ✅ typed now
    type,
    amount,
    plan,
    bonusType: type === "bonus" ? bonusType : undefined,
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

/**
 * Update transaction status (admin).
 * If status becomes "completed" (and wasn't completed already), update user wallets in same DB transaction.
 */
export const updateTransactionStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "success", "failed"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  // Start a mongoose session
  const session = await mongoose.startSession();

  try {
    let updatedTransaction;

    await session.withTransaction(async () => {
      // Load transaction inside session (for correct transactional view)
      const txn = await Transaction.findById(id).session(session);
      if (!txn) {
        // Throwing will abort the transaction
        throw new Error("Transaction not found");
      }

      const prevStatus = txn.status;

      // Update status
      txn.status = status;
      await txn.save({ session });

      // Only apply wallet changes when transitioning to success from non-success
      if (prevStatus !== "success" && status === "success") {
        // Apply wallet update atomically (uses $inc under the hood)
        await applyTransactionToWalletAtomic(txn, session);
      }

      // If transaction was previously completed and is being changed away from completed,
      // you might want to reverse the wallet change — handle that if relevant for your app.
      // Current code does NOT reverse previously applied completed transactions.

      // Return updated txn for response
      updatedTransaction = txn;
    }, {
      // Recommended options:
      readPreference: "primary",
      readConcern: { level: "local" },
      writeConcern: { w: "majority" },
    });

    // session.withTransaction resolved without throwing => commit done
    res.json(updatedTransaction);
  } catch (err: unknown) {
    // on error, transaction aborted automatically
    console.error("Error updating transaction status with session:", err);
    res.status(500).json({ message: (err instanceof Error) ? err.message : "Error updating transaction" });
  } finally {
    session.endSession();
  }
});

export const getUserBalances = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const user = await User.findById(req.user._id).select("mainWallet profitWallet");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    mainWallet: user.mainWallet,
    profitWallet: user.profitWallet,
    accountBalance: user.mainWallet + user.profitWallet,
  });
});

// server/src/controllers/transactionController.ts
export const getUserDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const userId = req.user._id;

  const transactions = await Transaction.find({ user: userId, status: "success" });

  // Aggregate totals
  const totals: Record<string, number> = {
    deposit: 0,
    investment: 0,
    profit: 0,
    withdrawal: 0,
    roi: 0,
  };

  let referralBonus = 0;
  let depositBonus = 0;
  let investmentBonus = 0;
  let signupBonus = 0; // ✅ new

  transactions.forEach((txn) => {
    if (txn.type === "bonus") {
      if (txn.bonusType === "referral") referralBonus += txn.amount;
      if (txn.bonusType === "deposit") depositBonus += txn.amount;
      if (txn.bonusType === "investment") investmentBonus += txn.amount;
      if (txn.bonusType === "signup") signupBonus += txn.amount; // ✅ new
    } else {
      totals[txn.type] = (totals[txn.type] || 0) + txn.amount;
    }
  });

  const referrals = await User.countDocuments({ referredBy: userId });

  res.json({
    allTransactions: transactions.length,
    totalDeposit: totals.deposit,
    totalInvestment: totals.investment,
    totalProfit: totals.profit,
    totalWithdraw: totals.withdrawal,
    referralBonus,
    depositBonus,
    investmentBonus,
    signupBonus, // ✅ include in response
    totalReferrals: referrals,
  });
});
