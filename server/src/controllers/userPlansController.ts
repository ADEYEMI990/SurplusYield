// server/src/controllers/userPlansController.ts
import { Request, Response } from "express";
import { Plan } from "../models/Plan";

export const getPlans = async (_: Request, res: Response) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json(plans);
  } catch {
    res.status(500).json({ message: "Error fetching plans" });
  }
};
