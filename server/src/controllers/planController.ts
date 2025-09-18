// server/src/controllers/planController.ts
import { Request, Response } from "express";
import { Plan } from "../models/Plan";

// Create a plan (Admin only)
export const createPlan = async (req: Request, res: Response) => {
  try {
    const plan = new Plan(req.body);
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: "Error creating plan", error });
  }
};

// Get all plans (Public for users)
export const getPlans = async (_: Request, res: Response) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching plans" });
  }
};

// Update a plan (Admin only)
export const updatePlan = async (req: Request, res: Response) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: "Error updating plan" });
  }
};

// Delete a plan (Admin only)
export const deletePlan = async (req: Request, res: Response) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json({ message: "Plan deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting plan" });
  }
};
