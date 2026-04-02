// server/src/controllers/planController.ts
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import path from "path";
import fs from "fs";
import asyncHandler from "express-async-handler";
import { Prisma } from "@prisma/client";

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

const calculateNumOfPeriods = (
  returnPeriod: "hour" | "daily" | "weekly",
  durationInDays: number
) : number => {
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

// Create a plan (Admin only)
export const createPlan = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    try {
      const body = req.body;

      const icon = req.file ? (req.file as any).location : undefined;
      console.log("Uploaded file:", req.file);

      const durationInDays = body.durationInDays
        ? Number(body.durationInDays)
        : null;

      const numOfPeriods = durationInDays
        ? calculateNumOfPeriods(body.returnPeriod, durationInDays)
        : null;

      const plan = await prisma.plan.create({
        data: {
          name: body.name,
          badge: body.badge,
          planType: body.planType,

          minAmount: body.minAmount
            ? new Prisma.Decimal(body.minAmount)
            : null,

          maxAmount: body.maxAmount
            ? new Prisma.Decimal(body.maxAmount)
            : null,

          amount: body.amount
            ? new Prisma.Decimal(body.amount)
            : null,

          roiType: body.roiType,

          roiValue: body.roiValue
            ? new Prisma.Decimal(body.roiValue)
            : null,

          minRoi: body.minRoi
            ? new Prisma.Decimal(body.minRoi)
            : null,

          maxRoi: body.maxRoi
            ? new Prisma.Decimal(body.maxRoi)
            : null,

          roiUnit: body.roiUnit,
          returnPeriod: body.returnPeriod,
          returnType: body.returnType,

          numOfPeriods,
          durationInDays,

          holidays: body.holidays
            ? Array.isArray(body.holidays)
              ? body.holidays
              : [body.holidays]
            : [],

          capitalBack: body.capitalBack === "true",
          featured: body.featured === "true",
          canCancel: body.canCancel === "true",
          trending: body.trending === "true",

          status: body.status || "active",

          icon,
        },
      });

      res.status(201).json(plan);
    } catch (error: any) {
      console.error(error);
      res.status(400).json({
        message: error.message,
      });
    }
  }
);

// Get all plans (Public for users)
export const getAllPlans = asyncHandler(async (req: any, res: Response): Promise<void> => {
  try {
    const plans = await prisma.plan.findMany();
    const enhancedPlans = plans.map((p) => ({
      ...p,
      durationInDays: deriveDurationInDays(p.returnPeriod as 'hour' | 'daily' | 'weekly', p.numOfPeriods ?? undefined),
    }));
    res.json(enhancedPlans);
    return;
  } catch (error) {
    res.status(500).json({ message: "Error fetching plans" });
    return;
  }
});

// Toggle plan status
export const togglePlanStatus = asyncHandler(async (req: any, res: Response): Promise<void> => {
  try {
    const plan = await prisma.plan.findUnique({ where: { id: req.params.id } });
    if (!plan) {
      res.status(404).json({ message: "Plan not found" });
      return;
    }
    const newStatus = plan.status === "active" ? "deactivated" : "active";
    await prisma.plan.update({ where: { id: req.params.id }, data: { status: newStatus } });
    res.json({ message: `Plan ${newStatus === "active" ? "activated" : "deactivated"}` });
    return;
  } catch {
    res.status(500).json({ message: "Error toggling plan" });
    return;
  }
});

// Get single plan
export const getPlan = asyncHandler(async (req: any, res: Response): Promise<void> => {
  try {
    const plan = await prisma.plan.findUnique({ where: { id: req.params.id } });
    if (!plan) {
      res.status(404).json({ message: "Plan not found" });
      return;
    }
    const enhancedPlan = {
      ...plan,
      durationInDays: deriveDurationInDays(plan.returnPeriod as 'hour' | 'daily' | 'weekly', plan.numOfPeriods ?? undefined),
    };
    res.json(enhancedPlan);
    return;
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({ message: "Error fetching plan" });
    return;
  }
});

// Update a plan (Admin only)
export const updatePlan = asyncHandler(async (req: any, res: Response) => {
  try {
    const icon = req.file ? (req.file as any).location : undefined;
    const body = req.body;

    const durationInDays = body.durationInDays ? Number(body.durationInDays) : undefined;
    const numOfPeriods =
      durationInDays && body.returnPeriod
        ? calculateNumOfPeriods(body.returnPeriod, durationInDays)
        : undefined;

    const updateData: any = {
      name: body.name,
      badge: body.badge,
      planType: body.planType,
      minAmount: body.minAmount ? new Prisma.Decimal(body.minAmount) : null,
      maxAmount: body.maxAmount ? new Prisma.Decimal(body.maxAmount) : null,
      amount: body.amount ? new Prisma.Decimal(body.amount) : null,
      roiType: body.roiType,
      roiValue: body.roiValue ? new Prisma.Decimal(body.roiValue) : null,
      minRoi: body.minRoi ? new Prisma.Decimal(body.minRoi) : null,
      maxRoi: body.maxRoi ? new Prisma.Decimal(body.maxRoi) : null,
      roiUnit: body.roiUnit,
      returnPeriod: body.returnPeriod,
      returnType: body.returnType,
      durationInDays,
      numOfPeriods,
      holidays: Array.isArray(body.holidays) ? body.holidays : body.holidays ? [body.holidays] : [],
      capitalBack: body.capitalBack === "true" || body.capitalBack === true,
      featured: body.featured === "true" || body.featured === true,
      canCancel: body.canCancel === "true" || body.canCancel === true,
      trending: body.trending === "true" || body.trending === true,
      status: body.status,
      ...(icon && { icon }), // only update if new icon uploaded
    };

    const plan = await prisma.plan.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(plan);
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ message: "Error updating plan", error });
  }
});

// Delete a plan (Admin only)
export const deletePlan = asyncHandler(async (req: any, res: Response): Promise<void> => {
  try {
    const plan = await prisma.plan.delete({ where: { id: req.params.id } });
    res.json({ message: "Plan deleted" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Error deleting plan" });
    return;
  }
});
