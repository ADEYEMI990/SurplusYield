// server/src/controllers/transactionController.ts
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Transaction } from "../models/Transaction";
import { applyTransactionToWalletAtomic } from "../utils/walletUtils";
import mongoose from "mongoose";
import User from "../models/User";
import { Plan } from "../models/Plan";
import path from "path";
import fs from "fs";

// Create transaction (User)
// ✅ Create Transaction (Deposit, Withdrawal, Bonus, Investment)
export const createTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }

    const {
      type,
      amount,
      planId,
      plan,
      bonusType,
      status,
      reference,
      walletType,
    } = req.body;

    if (!type || !amount) {
      res.status(400);
      throw new Error("Please provide type and amount");
    }

    // Handle optional receipt upload
    let receiptPath = "";
    if (req.file) {
      const uploadDir = path.join(__dirname, "../../uploads/receipts");
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      const fileName = `${Date.now()}_${req.file.originalname}`;
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, req.file.buffer);
      receiptPath = `/uploads/receipts/${fileName}`;
    }

    // ✅ Non-investment transactions
    if (type !== "investment") {
      const transaction = await Transaction.create({
        user: req.user._id,
        type,
        amount,
        plan,
        bonusType: type === "bonus" ? bonusType : undefined,
        status: status || "pending",
        receipt: receiptPath,
        reference,
      });

      // ✅ Update wallet only for successful transactions
      if (status === "success") {
        const user = await User.findById(req.user._id);
        if (user) {
          if (type === "deposit" || type === "bonus") {
            user.mainWallet += Number(amount);
          } else if (type === "withdrawal") {
            if (user.mainWallet < Number(amount)) {
              res.status(400);
              throw new Error("Insufficient balance for withdrawal");
            }
            user.mainWallet -= Number(amount);
          }
          await user.save();
        }
      }

      res.status(201).json({
        success: true,
        transaction,
      });
      return; // <-- optional, for readability
    }

    // ✅ Investment transaction
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const planData = await Plan.findById(planId);
    console.log("📊 Selected Plan:", planData);

    if (!planData) {
      res.status(404);
      throw new Error("Plan not found");
    }

    if (walletType === "main" && user.mainWallet < amount) {
      res.status(400);
      throw new Error("Insufficient balance in main wallet");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Determine first ROI payout time
      let nextPayoutAt = new Date();
      if (planData.returnPeriod === "hour") {
        nextPayoutAt.setHours(nextPayoutAt.getHours() + 1);
      } else if (planData.returnPeriod === "daily") {
        nextPayoutAt.setDate(nextPayoutAt.getDate() + 1);
      } else if (planData.returnPeriod === "weekly") {
        nextPayoutAt.setDate(nextPayoutAt.getDate() + 7);
      } else {
        // default fallback (1 day)
        nextPayoutAt.setDate(nextPayoutAt.getDate() + 1);
      }

      console.log("🕒 nextPayoutAt:", nextPayoutAt);

      const investment = await Transaction.create(
        [
          {
            user: user._id,
            plan: planData._id,
            type: "investment",
            amount,
            status: "success",
            currency: "USD",
            nextPayoutAt,
            roiAccrued: 0,
            durationInDays: planData.durationInDays,
          },
        ],
        { session }
      );

      user.mainWallet -= amount;

      const bonusAmount = amount * 0.2;
      user.profitWallet += bonusAmount;

      await Transaction.create(
        [
          {
            user: user._id,
            type: "bonus",
            bonusType: "investment",
            amount: bonusAmount,
            status: "success",
            currency: "USD",
          },
        ],
        { session }
      );

      await user.save({ session });
      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        message: "Investment successful ✅",
        investment,
      });
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      console.error("Investment failed:", error); // log for debugging
      res
        .status(400)
        .json({ message: error.message || "Investment failed", error });
    }
  }
);

// Get user transactions
export const getUserTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        res.status(401);
        throw new Error("Not authorized");
      }

      const transactions = await Transaction.find({ user: req.user._id })
        .populate(
          "plan",
          "name icon roiValue roiUnit planType capitalBack numOfPeriods returnPeriod badge durationInDays"
        )
        .sort({
          createdAt: -1,
        });

      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching transactions" });
    }
  }
);

// Get all transactions (Admin only)
export const getAllTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const transactions = await Transaction.find()
        .populate("user", "name email role")
        .sort({ createdAt: -1 });

      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching transactions" });
    }
  }
);

/**
 * Update transaction status (admin).
 * If status becomes "completed" (and wasn't completed already), update user wallets in same DB transaction.
 */
export const updateTransactionStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "success", "failed"].includes(status)) {
      res.status(400);
      throw new Error("Invalid status");
    }

    // Start session
    const session = await mongoose.startSession();

    try {
      let updatedTransaction;

      await session.withTransaction(
        async () => {
          // Fetch transaction in session
          const txn = await Transaction.findById(id).session(session);
          if (!txn) {
            throw new Error("Transaction not found");
          }

          const prevStatus = txn.status;

          // Update status
          txn.status = status;
          await txn.save({ session });

          // Apply wallet update only on first-time success
          if (prevStatus !== "success" && status === "success") {
            // Apply main wallet logic
            await applyTransactionToWalletAtomic(txn, session);

            // ✅ If deposit transaction → trigger deposit bonus
            if (txn.type === "deposit") {
              const user = await User.findById(txn.user).session(session);
              if (user) {
                const bonusAmount = txn.amount * 0.1; // 10% bonus

                // Update profit wallet
                user.profitWallet += bonusAmount;
                await user.save({ session });

                // Create bonus transaction
                await Transaction.create(
                  [
                    {
                      user: user._id,
                      type: "bonus",
                      bonusType: "deposit",
                      amount: bonusAmount,
                      status: "success",
                      currency: txn.currency || "USD",
                    },
                  ],
                  { session }
                );

                console.log(
                  `✅ Deposit bonus of $${bonusAmount.toFixed(2)} created for ${
                    user.email
                  }`
                );
              }
            }
          }

          // Return updated transaction
          updatedTransaction = txn;
        },
        {
          readPreference: "primary",
          readConcern: { level: "local" },
          writeConcern: { w: "majority" },
        }
      );

      // ✅ Transaction committed successfully
      res.json(updatedTransaction);
    } catch (err: unknown) {
      console.error("Error updating transaction status with session:", err);
      res.status(500).json({
        message:
          err instanceof Error
            ? err.message
            : "Error updating transaction status",
      });
    } finally {
      session.endSession();
    }
  }
);

export const getUserBalances = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }

    const user = await User.findById(req.user._id).select(
      "mainWallet profitWallet"
    );
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json({
      mainWallet: user.mainWallet,
      profitWallet: user.profitWallet,
      accountBalance: user.mainWallet + user.profitWallet,
    });
  }
);

// server/src/controllers/transactionController.ts
export const getUserDashboardStats = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }

    const userId = req.user._id;

    const transactions = await Transaction.find({
      user: userId,
      status: "success",
    });

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

        // ✅ Include ROI directly in profit total
        if (txn.type === "roi") totals.profit += txn.amount;
      }
    });

    const referrals = await User.countDocuments({ referredBy: userId });

    const totalProfit =
      totals.profit +
      referralBonus +
      depositBonus +
      investmentBonus +
      signupBonus;

    res.json({
      allTransactions: transactions.length,
      totalDeposit: totals.deposit,
      totalInvestment: totals.investment,
      totalProfit,
      totalWithdraw: totals.withdrawal,
      referralBonus,
      depositBonus,
      investmentBonus,
      signupBonus, // ✅ include in response
      totalReferrals: referrals,
    });
  }
);
