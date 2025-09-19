// server/src/controllers/adminTemplateController.ts
import { Request, Response } from "express";
import { Template } from "../models/Template";

export const createTemplate = async (req: Request, res: Response) => {
  try {
    const template = new Template(req.body);
    await template.save();
    res.status(201).json(template);
  } catch {
    res.status(400).json({ message: "Error creating template" });
  }
};

export const getAllTemplates = async (_: Request, res: Response) => {
  try {
    const templates = await Template.find();
    res.json(templates);
  } catch {
    res.status(500).json({ message: "Error fetching templates" });
  }
};
