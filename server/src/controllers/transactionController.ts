import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma";
import { applyTransactionToWalletAtomic } from "../utils/walletUtils";
import { sendNotification } from "../utils/notify";
import { getReference } from "../utils/getReference";
import path from "path";
import fs from "fs";
import { Prisma } from "@prisma/client";

// ...existing code...
// Create a transaction (user)
export const createTransaction = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }

    const { type, amount, currency = "USD", planId } = req.body;
    const userId = req.user.id;

    if (!type || !amount || Number(amount) <= 0) {
      res.status(400);
      throw new Error("Invalid transaction data");
    }

    // ==============================
    // ✅ INVESTMENT (Atomic + Ledger-Based)
    // ==============================
    if (type === "investment") {
      if (!planId) {
        res.status(400);
        throw new Error("Plan ID is required for investment");
      }

      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const baseFilter = {
          userId,
          status: "success",
        };

        // 1️⃣ Calculate REAL-TIME wallet inside transaction
        const [
          deposits,
          investments,
          withdrawals,
          capitalReturns,
        ] = await Promise.all([
          tx.transaction.aggregate({
            where: { ...baseFilter, type: "deposit" },
            _sum: { amount: true },
          }),
          tx.transaction.aggregate({
            where: { ...baseFilter, type: "investment" },
            _sum: { amount: true },
          }),
          tx.transaction.aggregate({
            where: { ...baseFilter, type: "withdrawal" },
            _sum: { amount: true },
          }),
          tx.transaction.aggregate({
            where: { ...baseFilter, type: "capitalReturn" },
            _sum: { amount: true },
          }),
        ]);

        const mainWallet =
          Number(deposits._sum.amount ?? 0) +
          Number(capitalReturns._sum.amount ?? 0) -
          Number(investments._sum.amount ?? 0) -
          Number(withdrawals._sum.amount ?? 0);

        if (mainWallet < Number(amount)) {
          throw new Error("Insufficient wallet balance");
        }

        // 2️⃣ Validate plan
        const plan = await tx.plan.findUnique({
          where: { id: planId },
        });

        if (!plan || plan.status !== "active") {
          throw new Error("Invalid or inactive plan");
        }

        // Fixed plan validation
        if (plan.planType === "fixed" && Number(plan.amount) !== Number(amount)) {
          throw new Error("Invalid fixed plan amount");
        }

        // Range plan validation
        if (
          plan.planType === "range" &&
          (Number(amount) < Number(plan.minAmount) ||
            Number(amount) > Number(plan.maxAmount))
        ) {
          throw new Error("Amount outside allowed range");
        }

        // 3️⃣ Create investment record
        const investment = await tx.investment.create({
          data: {
            userId,
            planId,
            amount: Number(amount),
            initialAmount: Number(amount),
            roiRate: Number(plan.roiValue || 0),
            roiInterval: plan.returnPeriod,
          },
        });

        // 4️⃣ Create transaction (THIS is the deduction)
        const transaction = await tx.transaction.create({
          data: {
            userId,
            planId,
            type: "investment",
            amount: Number(amount),
            currency,
            status: "success",
            reference: getReference(),
          },
        });

        // 5️⃣ Create 10% bonus
        const bonusAmount = Number(amount) * 0.1;

        const bonusTransaction = await tx.transaction.create({
          data: {
            userId,
            type: "bonus",
            bonusType: "investment",
            amount: bonusAmount,
            currency,
            status: "success",
            reference: getReference(),
          },
        });

        return { investment, transaction, bonusTransaction };
        });

      res.status(201).json({
        message: "Investment successful",
        data: result,
      });

      return;
    }

    // ==============================
    // ✅ WITHDRAWAL LOGIC
    // ==============================

    if (type === "withdrawal") {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1️⃣ Compute mainWallet and profitWallet inside transaction
        const baseFilter = { userId, status: "success" };

        const [
          deposits,
          investments,
          withdrawals,
          capitalReturns,
          profits,
        ] = await Promise.all([
          tx.transaction.aggregate({ where: { ...baseFilter, type: "deposit" }, _sum: { amount: true } }),
          tx.transaction.aggregate({ where: { ...baseFilter, type: "investment" }, _sum: { amount: true } }),
          tx.transaction.aggregate({ where: { ...baseFilter, type: "withdrawal" }, _sum: { amount: true } }),
          tx.transaction.aggregate({ where: { ...baseFilter, type: "capitalReturn" }, _sum: { amount: true } }),
          tx.transaction.aggregate({ where: { ...baseFilter, type: { in: ["roi", "bonus"] } }, _sum: { amount: true } }),
        ]);

        const mainWallet = Number(deposits._sum.amount ?? 0) + Number(capitalReturns._sum.amount ?? 0) - Number(investments._sum.amount ?? 0) - Number(withdrawals._sum.amount ?? 0);
        const profitWallet = Number(profits._sum.amount ?? 0);

        if (mainWallet + profitWallet < Number(amount)) {
          throw new Error("Insufficient wallet balance");
        }

        // 2️⃣ Ensure at least one completed investment exists
        const completedInvestments = await prisma.investment.findMany({
          where: { userId, status: "completed" },
        });

        if (completedInvestments.length === 0) {
          res.status(400);
          throw new Error("You need at least one completed investment to withdraw");
        }

        // 3️⃣ Referral requirement check
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (user?.referredBy) {
          const referredUsers = await tx.user.findMany({
            where: { referredBy: userId },
            select: { id: true },
          });

          if (referredUsers.length === 0) {
            throw new Error("You must have at least one referred user to withdraw");
          }

          const referredUserIds: string[] = referredUsers.map((u: { id: string }) => u.id);

          const successfulReferralDeposit = await tx.transaction.findFirst({
            where: {
              userId: { in: referredUserIds },
              type: "deposit",
              status: "success",
            },
          });

          if (!successfulReferralDeposit) {
            throw new Error(
              "At least one of your referred users must have made a successful deposit before you can withdraw"
            );
          }
        }

        // 3️⃣ Create withdrawal transaction
        const withdrawalTxn = await tx.transaction.create({
          data: {
            userId,
            type: "withdrawal",
            amount: Number(amount),
            currency,
            status: "pending", // Or "success" if auto-approved
            reference: getReference(),
          },
        });

        return withdrawalTxn;
      });

      res.status(201).json({ message: "Withdrawal request successful", data: result });
      return;
    }

    // ==============================
    // ✅ OTHER TRANSACTIONS
    // ==============================


    const txn = await prisma.transaction.create({
      data: {
        userId,
        type,
        amount: Number(amount),
        currency,
        planId: planId || undefined,
        status:
          type === "deposit" ? "pending" : "pending", // Adjust if needed
        reference: getReference(),
      },
    });

    res.status(201).json(txn);
  }
);

// Get all transactions (admin)
export const getAllTransactions = asyncHandler(async (req: any, res: Response): Promise<void> => {
  try {
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
        plan: {
          select: {
            name: true,
            icon: true,
            roiValue: true,
            roiUnit: true,
            planType: true,
            capitalBack: true,
            numOfPeriods: true,
            returnPeriod: true,
            badge: true,
            durationInDays: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(transactions);
    return;
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
    return;
  }
});

// Get user transactions
export const getUserTransactions = asyncHandler(
  async (req: any, res: Response) => {
    try {
      if (!req.user) {
        res.status(401);
        throw new Error("Not authorized");
      }
      const transactions = await prisma.transaction.findMany({
        where: { userId: req.user.id},
        include: {
          plan: {
            select: {
              name: true,
              icon: true,
              roiValue: true,
              roiUnit: true,
              planType: true,
              capitalBack: true,
              numOfPeriods: true,
              returnPeriod: true,
              badge: true,
              durationInDays: true,
            },
          },
          investment: true,
        },
        
        orderBy: { createdAt: "desc" },
      });
      res.json(
        transactions.map((tx: any) => ({
          ...tx,
          roiEarned: tx.investment?.roiEarned
          ? Number(tx.investment.roiEarned)
          : 0,
        }))
      );
    } catch (error: any) {
      console.error("🔥 getUserTransactions error:", error);
      res.status(500).json({
        message: "Error fetching transactions",
        error: error.message,
      });
    }
  }
);


// Get user Investments
export const getUserInvestments = asyncHandler(
  async (req: any, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }

    const investments = await prisma.investment.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            icon: true,
            roiValue: true,
            roiUnit: true,
            planType: true,
            capitalBack: true,
            numOfPeriods: true,
            returnPeriod: true,
            badge: true,
            durationInDays: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert Prisma Decimal safely
    const formatted = investments.map((inv:any) => ({
      ...inv,
      amount: Number(inv.amount.toString()),
      initialAmount: Number(inv.initialAmount.toString()),
      roiRate: Number(inv.roiRate.toString()),
      roiEarned: Number(inv.roiEarned.toString()),
    }));

    res.json(formatted);
  }
); 



/**
 * Update transaction status (admin).
 * If status becomes "completed" (and wasn't completed already), update user wallets in same DB transaction.
 */
export const updateTransactionStatus = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    let id = req.params.id;
    id = Array.isArray(id) ? id[0] : id;
    const { status } = req.body;
    if (!["pending", "success", "failed"].includes(status)) {
      res.status(400);
      throw new Error("Invalid status");
    }
    try {
      const txn = await prisma.transaction.findUnique({ where: { id } });
      if (!txn) {
        res.status(404).json({ message: "Transaction not found" });
        return;
      }
      const prevStatus = txn.status;
      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: { status },
      });
      // Apply wallet update only on first-time success
      if (prevStatus !== "success" && status === "success") {
        // Apply main wallet logic (implement logic as needed)
        // If deposit transaction → trigger deposit bonus
        if (txn.type === "deposit") {
          const user = await prisma.user.findUnique({
            where: { id: txn.userId },
          });

          if (user) {
            const bonusAmount = Number(txn.amount) * 0.1;

            // Create BONUS transaction only
            await prisma.transaction.create({
              data: {
                userId: user.id,
                type: "bonus",
                bonusType: "deposit",
                amount: bonusAmount,
                status: "success",
                currency: txn.currency || "USD",
                reference: getReference(),
              },
            });

            console.log(
              `✅ Deposit bonus of $${bonusAmount.toFixed(2)} created for ${user.email}`
            );
          }
        }
      }
      res.json(updatedTransaction);
    } catch (err: unknown) {
      console.error("Error updating transaction status:", err);
      res.status(500).json({
        message:
          err instanceof Error
            ? err.message
            : "Error updating transaction status",
      });
    }
  }
);

export const getUserBalances = asyncHandler(
  async (req: any, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }

    const userId = req.user.id;

    const baseFilter = {
      userId,
      status: "success",
    };

    // Run all aggregates in parallel
    const [
      deposits,
      investments,
      withdrawals,
      capitalReturns,
      profits,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...baseFilter, type: "deposit" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...baseFilter, type: "investment" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...baseFilter, type: "withdrawal" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...baseFilter, type: "capitalReturn" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          ...baseFilter,
          type: { in: ["roi", "bonus"] },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalDeposit = Number(deposits._sum.amount ?? 0);
    const totalInvestment = Number(investments._sum.amount ?? 0);
    const totalWithdrawal = Number(withdrawals._sum.amount ?? 0);
    const totalCapitalReturn = Number(capitalReturns._sum.amount ?? 0);
    const totalProfit = Number(profits._sum.amount ?? 0);

    const mainWallet =
      totalDeposit +
      totalCapitalReturn -
      totalInvestment -
      totalWithdrawal;

    const profitWallet = totalProfit;

    res.json({
      mainWallet,
      profitWallet,
      accountBalance: mainWallet + profitWallet,
      breakdown: {
        totalDeposit,
        totalInvestment,
        totalWithdrawal,
        totalCapitalReturn,
        totalProfit,
      },
    });
  }
);

// server/src/controllers/transactionController.ts
export const getUserDashboardStats = asyncHandler(
  async (req: any, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }
    const userId = req.user.id;
    const transactions = await prisma.transaction.findMany({
      where: { userId, status: "success" },
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
    let signupBonus = 0;
    transactions.forEach((txn: any) => {
      if (txn.type === "bonus") {
        if (txn.bonusType === "referral") referralBonus += Number(txn.amount);
        if (txn.bonusType === "deposit") depositBonus += Number(txn.amount);
        if (txn.bonusType === "investment") investmentBonus += Number(txn.amount);
        if (txn.bonusType === "signup") signupBonus += Number(txn.amount);
      } else {
        totals[txn.type] = (totals[txn.type] || 0) + Number(txn.amount);
        if (txn.type === "roi") totals.profit += Number(txn.amount);
      }
    });
    const referrals = await prisma.user.count({ where: { referredBy: userId } });
    const totalProfit = totals.profit + referralBonus + depositBonus + investmentBonus + signupBonus;
    res.json({
      allTransactions: transactions.length,
      totalDeposit: totals.deposit,
      totalInvestment: totals.investment,
      totalProfit,
      totalWithdraw: totals.withdrawal,
      referralBonus,
      depositBonus,
      investmentBonus,
      signupBonus,
      totalReferrals: referrals,
    });
  }
);
