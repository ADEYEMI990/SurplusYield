import { Request, Response } from "express";
import Landing from "../../models/site/Landing";

export const createSection = async (req: Request, res: Response) => {
  try {
    const section = await Landing.create(req.body);
    res.status(201).json(section);
  } catch (err) {
    res.status(500).json({ error: "Error creating landing section" });
  }
};

export const getSections = async (_: Request, res: Response) => {
  try {
    const sections = await Landing.find();
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: "Error fetching landing sections" });
  }
};

export const updateSection = async (req: Request, res: Response) => {
  try {
    const section = await Landing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: "Error updating landing section" });
  }
};
