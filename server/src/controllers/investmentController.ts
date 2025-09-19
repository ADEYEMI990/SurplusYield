// server/src/controllers/investmentController.ts
import { Response } from "express";
import Wallet from "../models/Wallet";
import { Transaction } from "../models/Transaction";
import { Plan } from "../models/Plan";

export const investInPlan = async (req: any, res: Response) => {
  try {
    const { planId, amount } = req.body;

    if (!planId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid investment request" });
    }

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: "Plan not found or inactive" });
    }

    let wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    wallet.balance -= amount;
    await wallet.save();

    const txn = await Transaction.create({
      user: req.user._id,
      type: "investment",
      amount,
      plan: plan._id,
      status: "active",
    });

    res.json({ message: "Investment successful", transaction: txn, balance: wallet.balance });
  } catch (error) {
    console.error("Investment error:", error);
    res.status(500).json({ message: "Error processing investment" });
  }
};
