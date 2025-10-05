// server/src/routes/transactionRoutes.ts
import express from "express";
import multer from "multer";
import { createTransaction, updateTransactionStatus, getUserTransactions, getAllTransactions, getUserBalances, getUserDashboardStats } from "../controllers/transactionController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

// Use multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", protect, upload.single("receipt"), createTransaction);          // user
router.get("/my", protect, getUserTransactions);       // user
router.get("/balances", protect, getUserBalances);    // user
router.get("/stats", protect, getUserDashboardStats); // user
router.get("/", protect, admin, getAllTransactions); // admin
router.put("/:id/status", protect, admin, updateTransactionStatus); // admin

export default router;
