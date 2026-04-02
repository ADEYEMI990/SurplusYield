import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma";

// Create spotlight (admin)
export const createSpotlight = asyncHandler(async (req: Request, res: Response) => {
  const { type, title, subtitle, date, status, net, total, amount, meta, order } = req.body;
  if (!type || !title) {
    res.status(400);
    throw new Error("type and title are required");
  }

  const spotlight = await prisma.spotlight.create({
    data: {
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
      createdBy: (req as any).user?.id,
    },
  });
  res.status(201).json({ success: true, spotlight });
});

// Update spotlight (admin)
export const updateSpotlight = asyncHandler(async (req: Request, res: Response) => {
  let id = req.params.id;
  id = Array.isArray(id) ? id[0] : id;
  const update = req.body;
  try {
    const spotlight = await prisma.spotlight.update({
      where: { id },
      data: update,
    });
    res.json({ success: true, spotlight });
  } catch (e) {
    res.status(404);
    throw new Error("Spotlight not found");
  }
});

// Delete spotlight (admin)
export const deleteSpotlight = asyncHandler(async (req: Request, res: Response) => {
  let id = req.params.id;
  id = Array.isArray(id) ? id[0] : id;
  try {
    await prisma.spotlight.delete({ where: { id } });
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.status(404);
    throw new Error("Spotlight not found");
  }
});

// List all spotlights (public)
export const listSpotlights = asyncHandler(async (req: Request, res: Response) => {
  const type = req.query.type as string | undefined;
  const where = type ? { type } : {};
  const items = await prisma.spotlight.findMany({
    where,
    orderBy: [
      { order: "asc" },
      { createdAt: "desc" },
    ],
    take: 50,
  });
  res.json(items);
});

// admin list (all)
export const adminListSpotlights = asyncHandler(async (req: Request, res: Response) => {
  const items = await prisma.spotlight.findMany({
    orderBy: [
      { order: "asc" },
      { createdAt: "desc" },
    ],
  });
  res.json(items);
});
