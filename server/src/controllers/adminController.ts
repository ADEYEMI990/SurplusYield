// server/src/controllers/adminController.ts
import { Request, Response } from "express";
import  User  from "../models/User";
import { Transaction } from "../models/Transaction";
import { Plan } from "../models/Plan";

// ================= Customers =================

// Get all customers
export const getAllCustomers = async (_: Request, res: Response) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers" });
  }
};

// Activate / Disable customer
export const toggleCustomerStatus = async (req: Request, res: Response) => {
  try {
    const user = await User.findById({_id: req.params.id, role: "user"});
    if (!user) return res.status(404).json({ message: "Customer not found" });

    user.status = user.status === "active" ? "disabled" : "active";
    await user.save();

    res.json({ message: `Customer ${user.status}` });
  } catch (error) {
    res.status(500).json({ message: "Error updating customer status" });
  }
};

// ================= KYC =================

// Submit KYC (User would call this, admin verifies)
export const verifyKYC = async (req: Request, res: Response) => {
  try {
    const { status } = req.body; // e.g. "approved" or "rejected"
    const user = await User.findById({ _id: req.params.id, role: "user" });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.kycStatus = status;
    await user.save();

    res.json({ message: `KYC ${status} for ${user.email}` });
  } catch (error) {
    res.status(500).json({ message: "Error verifying KYC" });
  }
};

// ================= Dashboard Summary =================
export const getDashboardStats = async (_: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalPlans = await Plan.countDocuments();
    const totalTxs = await Transaction.countDocuments();

    res.json({
      totalUsers,
      totalPlans,
      totalTransactions: totalTxs
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};