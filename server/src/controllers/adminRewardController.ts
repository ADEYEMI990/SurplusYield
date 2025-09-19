// server/src/controllers/adminRewardController.ts
import { Request, Response } from "express";
import { Reward } from "../models/Reward";

export const getAllRewards = async (_: Request, res: Response) => {
  try {
    const rewards = await Reward.find().populate("user", "email");
    res.json(rewards);
  } catch {
    res.status(500).json({ message: "Error fetching rewards" });
  }
};