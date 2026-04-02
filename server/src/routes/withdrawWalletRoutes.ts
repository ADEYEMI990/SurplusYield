
import express from "express";
import { saveOrUpdateBTCAddress, getAllWithdrawWallets } from "../controllers/withdrawWalletController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

// User endpoint
router.post("/", protect, saveOrUpdateBTCAddress);

// Admin endpoint
router.get("/", protect, admin, getAllWithdrawWallets);

export default router;
