import { Request, Response } from "express";
import Navigation from "../../models/site/Navigation";

// Create nav item
export const createNavItem = async (req: Request, res: Response) => {
  try {
    const nav = await Navigation.create(req.body);
    res.status(201).json(nav);
  } catch (err) {
    res.status(500).json({ error: "Error creating navigation item" });
  }
};

// Get all nav items
export const getNavItems = async (_: Request, res: Response) => {
  try {
    const navs = await Navigation.find().sort({ order: 1 });
    res.json(navs);
  } catch (err) {
    res.status(500).json({ error: "Error fetching navigation items" });
  }
};

// Update nav item
export const updateNavItem = async (req: Request, res: Response) => {
  try {
    const nav = await Navigation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!nav) return res.status(404).json({ error: "Navigation item not found" });
    res.json(nav);
  } catch (err) {
    res.status(500).json({ error: "Error updating navigation item" });
  }
};

// Delete nav item
export const deleteNavItem = async (req: Request, res: Response) => {
  try {
    const nav = await Navigation.findByIdAndDelete(req.params.id);
    if (!nav) return res.status(404).json({ error: "Navigation item not found" });
    res.json({ message: "Navigation item deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting navigation item" });
  }
};
