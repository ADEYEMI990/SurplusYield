import { Request, Response } from "express";
import Page from "../../models/site/Page";

// Create a page
export const createPage = async (req: Request, res: Response) => {
  try {
    const page = await Page.create(req.body);
    res.status(201).json(page);
  } catch (err) {
    res.status(500).json({ error: "Error creating page" });
  }
};

// Get all pages
export const getPages = async (_: Request, res: Response) => {
  try {
    const pages = await Page.find();
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: "Error fetching pages" });
  }
};

// Get single page by slug
export const getPageBySlug = async (req: Request, res: Response) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: "Error fetching page" });
  }
};

// Update page
export const updatePage = async (req: Request, res: Response) => {
  try {
    const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: "Error updating page" });
  }
};

// Delete page
export const deletePage = async (req: Request, res: Response) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json({ message: "Page deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting page" });
  }
};
