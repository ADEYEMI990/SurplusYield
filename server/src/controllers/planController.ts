// server/src/controllers/planController.ts
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import path from "path";
import fs from "fs";
import asyncHandler from "express-async-handler";
import { Prisma } from "@prisma/client";
import { cloudinary } from "../config/cloudinary"; // Add this

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

      // Get Cloudinary URL from uploaded file
      const icon = req.file ? (req.file as any).path : undefined;
      console.log("Uploaded file:", req.file);
      console.log("Cloudinary URL:", icon);

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

          icon, // Store Cloudinary URL
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
export const updatePlan = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const body = req.body;

      // Get current plan to check if we need to delete old icon
      const currentPlan = await prisma.plan.findUnique({
        where: { id },
      });

      if (!currentPlan) {
        res.status(404).json({ message: "Plan not found" });
        return;
      }

      // Get new icon URL if uploaded
      let icon = currentPlan.icon;
      if (req.file) {
        // Delete old icon from Cloudinary if it exists
        if (currentPlan.icon) {
          try {
            // Extract public ID from URL
            const urlParts = currentPlan.icon.split("/");
            const fileName = urlParts[urlParts.length - 1];
            const publicId = `surplusyield/plans/${fileName.split(".")[0]}`;
            await cloudinary.uploader.destroy(publicId);
            console.log("Deleted old icon from Cloudinary");
          } catch (error) {
            console.error("Error deleting old icon:", error);
            // Continue even if deletion fails
          }
        }
        icon = (req.file as any).path; // New Cloudinary URL
      }

      const durationInDays = body.durationInDays
        ? Number(body.durationInDays)
        : currentPlan.durationInDays;

      const numOfPeriods = durationInDays
        ? calculateNumOfPeriods(body.returnPeriod || currentPlan.returnPeriod, durationInDays)
        : currentPlan.numOfPeriods;

      const updatedPlan = await prisma.plan.update({
        where: { id },
        data: {
          name: body.name || currentPlan.name,
          badge: body.badge !== undefined ? body.badge : currentPlan.badge,
          planType: body.planType || currentPlan.planType,
          
          minAmount: body.minAmount !== undefined
            ? new Prisma.Decimal(body.minAmount)
            : currentPlan.minAmount,
          
          maxAmount: body.maxAmount !== undefined
            ? new Prisma.Decimal(body.maxAmount)
            : currentPlan.maxAmount,
          
          amount: body.amount !== undefined
            ? new Prisma.Decimal(body.amount)
            : currentPlan.amount,
          
          roiType: body.roiType || currentPlan.roiType,
          
          roiValue: body.roiValue !== undefined
            ? new Prisma.Decimal(body.roiValue)
            : currentPlan.roiValue,
          
          minRoi: body.minRoi !== undefined
            ? new Prisma.Decimal(body.minRoi)
            : currentPlan.minRoi,
          
          maxRoi: body.maxRoi !== undefined
            ? new Prisma.Decimal(body.maxRoi)
            : currentPlan.maxRoi,
          
          roiUnit: body.roiUnit || currentPlan.roiUnit,
          returnPeriod: body.returnPeriod || currentPlan.returnPeriod,
          returnType: body.returnType || currentPlan.returnType,
          
          numOfPeriods,
          durationInDays,
          
          holidays: body.holidays
            ? Array.isArray(body.holidays)
              ? body.holidays
              : [body.holidays]
            : currentPlan.holidays,
          
          capitalBack: body.capitalBack !== undefined
            ? body.capitalBack === "true"
            : currentPlan.capitalBack,
          
          featured: body.featured !== undefined
            ? body.featured === "true"
            : currentPlan.featured,
          
          canCancel: body.canCancel !== undefined
            ? body.canCancel === "true"
            : currentPlan.canCancel,
          
          trending: body.trending !== undefined
            ? body.trending === "true"
            : currentPlan.trending,
          
          status: body.status || currentPlan.status,
          
          icon,
        },
      });

      res.status(200).json(updatedPlan);
    } catch (error: any) {
      console.error(error);
      res.status(400).json({
        message: error.message,
      });
    }
  }
);

// Delete a plan (Admin only)
export const deletePlan = asyncHandler(
  async (req: any, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const plan = await prisma.plan.findUnique({
        where: { id },
      });

      if (!plan) {
        res.status(404).json({ message: "Plan not found" });
        return;
      }

      // Delete icon from Cloudinary if it exists
      if (plan.icon) {
        try {
          const urlParts = plan.icon.split("/");
          const fileName = urlParts[urlParts.length - 1];
          const publicId = `surplusyield/plans/${fileName.split(".")[0]}`;
          await cloudinary.uploader.destroy(publicId);
          console.log("Deleted icon from Cloudinary");
        } catch (error) {
          console.error("Error deleting icon:", error);
          // Continue even if deletion fails
        }
      }

      await prisma.plan.delete({
        where: { id },
      });

      res.status(200).json({ message: "Plan deleted successfully" });
    } catch (error: any) {
      console.error(error);
      res.status(400).json({
        message: error.message,
      });
    }
  }
);
