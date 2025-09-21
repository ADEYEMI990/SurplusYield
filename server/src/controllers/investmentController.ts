// server/src/controllers/investmentController.ts
import { Response } from "express";
import Wallet from "../models/Wallet";
import { Transaction } from "../models/Transaction";
import { Plan } from "../models/Plan";
import Investment from "../models/Investment";

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

    // Copy plan settings into investment
    const investment = new Investment({
      user: req.user._id,
      plan: plan._id,
      amount,
      initialAmount: amount,
      roiRate: plan.roiRate,
      roiInterval: plan.roiInterval,
      roiType: plan.roiType, // ✅ copy roiType
      startDate: new Date(),
      endDate: new Date(Date.now() + plan.durationInDays * 24 * 60 * 60 * 1000), // duration in days
    });

    await investment.save();

    res.status(201).json(investment);
  } catch (error) {
    console.error("Error creating investment:", error);
    res.status(500).json({ message: "Error creating investment" });
  }

  //   const txn = await Transaction.create({
  //     user: req.user._id,
  //     type: "investment",
  //     amount,
  //     plan: plan._id,
  //     status: "active",
  //   });

  //   res.json({ message: "Investment successful", transaction: txn, balance: wallet.balance });
  // } catch (error) {
  //   console.error("Investment error:", error);
  //   res.status(500).json({ message: "Error processing investment" });
  // }
};
