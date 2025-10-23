// server/src/controllers/adminController.ts
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User";
import { Transaction } from "../models/Transaction";

export const getAdminStats = asyncHandler(async (req: Request, res: Response) => {
  const [totalUsers, totalTransactions, deposits, withdrawals, investments] =
    await Promise.all([
      User.countDocuments({ role: "user" }),
      Transaction.countDocuments(),
      Transaction.aggregate([
        { $match: { type: "deposit", status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { type: "withdrawal", status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Transaction.aggregate([
        { $match: { type: "investment", status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

  const chartData = await Transaction.aggregate([
    {
      $match: { status: "success" },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    {
      $group: {
        _id: "$_id.date",
        deposits: {
          $sum: {
            $cond: [{ $eq: ["$_id.type", "deposit"] }, "$total", 0],
          },
        },
        withdrawals: {
          $sum: {
            $cond: [{ $eq: ["$_id.type", "withdrawal"] }, "$total", 0],
          },
        },
        investments: {
          $sum: {
            $cond: [{ $eq: ["$_id.type", "investment"] }, "$total", 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // ✅ Construct final JSON response
  const responseData = {
    totalUsers,
    totalDeposits: deposits[0]?.total || 0,
    totalWithdrawals: withdrawals[0]?.total || 0,
    totalInvestments: investments[0]?.total || 0,
    totalTransactions,
    chartData: chartData.map((c) => ({
      date: c._id,
      deposits: c.deposits,
      withdrawals: c.withdrawals,
      investments: c.investments,
    })),
  };

  // ✅ Log all response data in a formatted way
  console.log("\n📊 ===== ADMIN DASHBOARD STATS =====");
  console.log(JSON.stringify(responseData, null, 2));
  console.log("===================================\n");

  // Send the data to frontend
  res.json(responseData);
});