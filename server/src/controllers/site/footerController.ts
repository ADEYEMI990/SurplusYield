import { Request, Response } from "express";
import Footer from "../../models/site/Footer";

// Create footer section
export const createFooterSection = async (req: Request, res: Response) => {
  try {
    const footer = await Footer.create(req.body);
    res.status(201).json(footer);
  } catch (err) {
    res.status(500).json({ error: "Error creating footer section" });
  }
};

// Get all footer sections
export const getFooterSections = async (_: Request, res: Response) => {
  try {
    const footers = await Footer.find();
    res.json(footers);
  } catch (err) {
    res.status(500).json({ error: "Error fetching footer sections" });
  }
};

// Update footer section
export const updateFooterSection = async (req: Request, res: Response) => {
  try {
    const footer = await Footer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!footer) return res.status(404).json({ error: "Footer section not found" });
    res.json(footer);
  } catch (err) {
    res.status(500).json({ error: "Error updating footer section" });
  }
};

// Delete footer section
export const deleteFooterSection = async (req: Request, res: Response) => {
  try {
    const footer = await Footer.findByIdAndDelete(req.params.id);
    if (!footer) return res.status(404).json({ error: "Footer section not found" });
    res.json({ message: "Footer section deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting footer section" });
  }
};
