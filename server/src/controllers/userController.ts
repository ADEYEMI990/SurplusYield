// server/src/controllers/userController.ts
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User";
import { Transaction } from "../models/Transaction";

/**
 * @desc Check referral and deposit status for current user
 * @route GET /api/users/referral-status
 * @access Private
 */
export const getReferralDepositStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized");
    }

    const userId = req.user._id;

    // ✅ Find users referred by current user
    const referredUsers = await User.find({ referredBy: userId }).select("_id email");

    if (referredUsers.length === 0) {
      res.json({
        totalReferrals: 0,
        referredUsers: [],
        hasDepositingReferral: false,
      });
      return;
    }

    // ✅ Check if any of those referrals have a successful deposit transaction
    const referralIds = referredUsers.map((u) => u._id);

    const depositTxn = await Transaction.findOne({
      user: { $in: referralIds },
      type: "deposit",
      status: "success",
    });

    const hasDepositingReferral = !!depositTxn;

    res.json({
      totalReferrals: referredUsers.length,
      referredUsers,
      hasDepositingReferral,
    });
  }
);
