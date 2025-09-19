// server/src/routes/userRoutes.ts
import { Router } from "express";
import { getPlans } from "../controllers/userPlansController";
import { getWallet, deposit, withdraw } from "../controllers/walletController";
import { getUserTransactions } from "../controllers/userTransactionsController";
import { investInPlan } from "../controllers/investmentController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Public
router.get("/plans", getPlans);

// Protected
router.get("/wallet", protect, getWallet);
router.post("/wallet/deposit", protect, deposit);
router.post("/wallet/withdraw", protect, withdraw);

router.get("/transactions", protect, getUserTransactions);
router.post("/invest", protect, investInPlan);

export default router;
