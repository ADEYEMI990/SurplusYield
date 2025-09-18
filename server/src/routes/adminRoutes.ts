// server/src/routes/adminRoutes.ts
import express from "express";
import {
  getAllCustomers,
  toggleCustomerStatus,
  verifyKYC,
  getDashboardStats
} from "../controllers/adminController";
import { protect, admin } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect, admin);

// Customers
router.get("/customers", getAllCustomers);
router.put("/customers/:id/toggle", toggleCustomerStatus);

// KYC
router.put("/kyc/:id", verifyKYC);

// Dashboard
router.get("/stats", getDashboardStats);

export default router;
