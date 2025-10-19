import express from "express";
import {
  createSpotlight,
  updateSpotlight,
  deleteSpotlight,
  listSpotlights,
  adminListSpotlights,
} from "../controllers/spotlightController";
import { protect, admin } from "../middleware/authMiddleware"; // adjust import to your project

const router = express.Router();

// public list
router.get("/", listSpotlights);

// admin CRUD
router.get("/admin", protect, admin, adminListSpotlights);
router.post("/admin", protect, admin, createSpotlight);
router.put("/admin/:id", protect, admin, updateSpotlight);
router.delete("/admin/:id", protect, admin, deleteSpotlight);

export default router;
