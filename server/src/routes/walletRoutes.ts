import express from "express";
import { getWallet, updateWallet } from "../controllers/walletController";
import { protect, admin } from "../middleware/authMiddleware";// if you have admin middleware

const router = express.Router();

// GET current wallet
router.get("/", protect, getWallet);

// UPDATE wallet (admin only)
router.put("/", protect, admin, updateWallet);

export default router;
