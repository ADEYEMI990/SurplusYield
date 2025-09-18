// server/src/routes/transactionRoutes.ts
import express from "express";
import { createTransaction, getUserTransactions, getAllTransactions } from "../controllers/transactionController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createTransaction);          // user
router.get("/my", protect, getUserTransactions);       // user
router.get("/", protect, admin, getAllTransactions); // admin

export default router;
