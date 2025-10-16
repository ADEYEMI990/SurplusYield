import express from "express";
import { saveWithdrawWallet, getAllWithdrawWallets } from "../controllers/withdrawWalletController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

// User endpoint
router.post("/", protect, saveWithdrawWallet);

// Admin endpoint
router.get("/", protect, admin, getAllWithdrawWallets);

export default router;
