// server/src/controllers/planController.ts
import { Request, Response } from "express";
import { Plan } from "../models/Plan";
import path from "path";
import fs from "fs";

const calculateNumOfPeriods = (
  returnPeriod: "hour" | "daily" | "weekly",
  durationInDays: number
): number => {
  switch (returnPeriod) {
    case "hour":
      return durationInDays * 24; // every hour
    case "daily":
      return durationInDays; // once per day
    case "weekly":
      return Math.ceil(durationInDays / 7); // once per week
    default:
      return durationInDays;
  }
};

const deriveDurationInDays = (
  returnPeriod: "hour" | "daily" | "weekly",
  numOfPeriods?: number
): number => {
  if (!numOfPeriods) return 0;

  switch (returnPeriod) {
    case "hour":
      return Math.ceil(numOfPeriods / 24); // 24 hours in a day
    case "daily":
      return numOfPeriods;
    case "weekly":
      return numOfPeriods * 7;
    default:
      return numOfPeriods;
  }
};

// Create a plan (Admin only)
export const createPlan = async (req: Request, res: Response) => {
  try {
    const icon = req.file ? `/uploads/${req.file.filename}` : undefined;

    const { durationInDays, returnPeriod } = req.body;

    // Compute numOfPeriods automatically
    const numOfPeriods = calculateNumOfPeriods(returnPeriod, Number(durationInDays));

    const plan = new Plan({ ...req.body, icon, numOfPeriods, durationInDays });
    await plan.save();
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ message: "Error creating plan", error });
  }
};

// Get all plans (Public for users)
export const getPlans = async (_: Request, res: Response) => {
  try {
    const plans = await Plan.find();
    const enhancedPlans = plans.map((p) => ({
      ...p.toObject(),
      durationInDays: deriveDurationInDays(p.returnPeriod, p.numOfPeriods),
    }));
    res.json(enhancedPlans);
  } catch (error) {
    res.status(500).json({ message: "Error fetching plans" });
  }
};

// Toggle plan status
export const togglePlanStatus = async (req: Request, res: Response) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    plan.status = plan.status === "active" ? "deactivated" : "active";
    await plan.save();
    res.json({ message: `Plan ${plan.status === "active" ? "activated" : "deactivated"}` });
  } catch {
    res.status(500).json({ message: "Error toggling plan" });
  }
};

// Get single plan
export const getPlanById = async (req: Request, res: Response) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    const enhancedPlan = {
      ...plan.toObject(),
      durationInDays: deriveDurationInDays(plan.returnPeriod, plan.numOfPeriods),
    };

    res.json(enhancedPlan);
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({ message: "Error fetching plan" });
  }
};

// Update a plan (Admin only)
export const updatePlan = async (req: Request, res: Response) => {
  try {
    const icon = req.file ? `/uploads/${req.file.filename}` : undefined;

    const { durationInDays, returnPeriod } = req.body;

    const updateData = icon ? { ...req.body, icon } : req.body;

    if (durationInDays && returnPeriod) {
      updateData.numOfPeriods = calculateNumOfPeriods(returnPeriod, Number(durationInDays));
    }

    const plan = await Plan.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json(plan);
  } catch (error) {
    res.status(400).json({ message: "Error updating plan", error });
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
