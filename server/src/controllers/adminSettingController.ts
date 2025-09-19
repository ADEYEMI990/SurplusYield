// server/src/controllers/adminSettingController.ts
import { Request, Response } from "express";
import { Setting } from "../models/Setting";

export const getAllSettings = async (_: Request, res: Response) => {
  try {
    const settings = await Setting.find();
    res.json(settings);
  } catch {
    res.status(500).json({ message: "Error fetching settings" });
  }
};

export const updateSetting = async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;
    const setting = await Setting.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
    res.json(setting);
  } catch {
    res.status(500).json({ message: "Error updating setting" });
  }
};
