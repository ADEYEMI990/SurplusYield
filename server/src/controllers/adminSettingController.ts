import { Response } from "express";
import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma";

export const getAllSettings = asyncHandler(async (req: any, res: Response): Promise<void> => {
  try {
    const settings = await prisma.setting.findMany();
    res.json(settings);
    return;
  } catch {
    res.status(500).json({ message: "Error fetching settings" });
    return;
  }
});

export const upsertSetting = asyncHandler(async (req: any, res: Response): Promise<void> => {
  try {
    const { key, value } = req.body;
    let setting = await prisma.setting.findUnique({ where: { key } });
    if (setting) {
      setting = await prisma.setting.update({ where: { key }, data: { value } });
    } else {
      setting = await prisma.setting.create({ data: { key, value } });
    }
    res.json(setting);
    return;
  } catch {
    res.status(500).json({ message: "Error updating setting" });
    return;
  }
});
