import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Spotlight from "../models/Spotlight";
import mongoose from "mongoose";

// Create spotlight (admin)
export const createSpotlight = asyncHandler(async (req: Request, res: Response) => {
  const { type, title, subtitle, date, status, net, total, amount, meta, order } = req.body;
  if (!type || !title) {
    res.status(400);
    throw new Error("type and title are required");
  }

  const spotlight = await Spotlight.create({
    type,
    title,
    subtitle,
    date: date ? new Date(date) : undefined,
    status,
    net,
    total,
    amount,
    meta,
    order,
    createdBy: (req as any).user?._id,
  });

  res.status(201).json({ success: true, spotlight });
});

// Update spotlight (admin)
export const updateSpotlight = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const update = req.body;
  const spotlight = await Spotlight.findByIdAndUpdate(id, update, { new: true });
  if (!spotlight) {
    res.status(404);
    throw new Error("Spotlight not found");
  }
  res.json({ success: true, spotlight });
});

// Delete spotlight (admin)
export const deleteSpotlight = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const spotlight = await Spotlight.findByIdAndDelete(id);
  if (!spotlight) {
    res.status(404);
    throw new Error("Spotlight not found");
  }
  res.json({ success: true, message: "Deleted" });
});

// List all spotlights (public)
export const listSpotlights = asyncHandler(async (req: Request, res: Response) => {
  // optional query param: type=investment|withdraw
  const type = req.query.type as string | undefined;
  const q: any = {};
  if (type) q.type = type;
  const items = await Spotlight.find(q).sort({ order: 1, createdAt: -1 }).limit(50);
  res.json(items);
});

// admin list (all)
export const adminListSpotlights = asyncHandler(async (req: Request, res: Response) => {
  const items = await Spotlight.find().sort({ order: 1, createdAt: -1 });
  res.json(items);
});
