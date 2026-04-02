
import express from "express";
import { getWallet, updateOrCreateWallet } from "../controllers/walletController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

// GET current wallet
// UPDATE wallet (admin only)
router.put("/", protect, admin, updateOrCreateWallet);
router.get("/", getWallet);

export default router;
