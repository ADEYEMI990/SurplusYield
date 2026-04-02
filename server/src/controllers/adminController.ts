// server/src/controllers/adminController.ts
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma";

export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  // Basic counts
  const [totalUsers, totalTransactions] = await Promise.all([
    prisma.user.count({ where: { role: "user" } }),
    prisma.transaction.count(),
  ]);

  // Sums for deposits, withdrawals, investments
  const [deposits, withdrawals, investments] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "deposit", status: "success" },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "withdrawal", status: "success" },
    }),
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: "investment", status: "success" },
    }),
  ]);

  // Chart data: group by date and type
  const txns = await prisma.transaction.findMany({
    where: { status: "success" },
    select: { createdAt: true, type: true, amount: true },
    orderBy: { createdAt: "asc" },
  });
  // Group by date and type in JS
  const chartMap: Record<string, { deposits: number; withdrawals: number; investments: number }> = {};
  txns.forEach((txn) => {
    const date = txn.createdAt.toISOString().slice(0, 10);
    if (!chartMap[date]) {
      chartMap[date] = { deposits: 0, withdrawals: 0, investments: 0 };
    }
    if (txn.type === "deposit") chartMap[date].deposits += Number(txn.amount);
    if (txn.type === "withdrawal") chartMap[date].withdrawals += Number(txn.amount);
    if (txn.type === "investment") chartMap[date].investments += Number(txn.amount);
  });
  const chartData = Object.entries(chartMap).map(([date, vals]) => ({ date, ...vals }));

  const responseData = {
    totalUsers,
    totalDeposits: deposits._sum.amount || 0,
    totalWithdrawals: withdrawals._sum.amount || 0,
    totalInvestments: investments._sum.amount || 0,
    totalTransactions,
    chartData,
  };

  console.log("===== ADMIN DASHBOARD STATS =====");
  console.log(JSON.stringify(responseData, null, 2));
  console.log("===================================");

  res.json(responseData);
});