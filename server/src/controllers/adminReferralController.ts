// server/src/controllers/adminReferralController.ts
import { Request, Response } from "express";
import User  from "../models/User";

export const getReferralTree = async (_: Request, res: Response) => {
  try {
    const users = await User.find().populate("referredBy", "email");
    res.json(users);
  } catch {
    res.status(500).json({ message: "Error fetching referrals" });
  }
};
