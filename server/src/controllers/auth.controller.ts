import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import User from "../models/User";
import Admin from "../models/Admin";
import { Transaction } from "../models/Transaction";
import mongoose from "mongoose";

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES || "7d") as SignOptions["expiresIn"],
  });
};

function generateReferralCode(name: string, email: string): string {
  const base = name.split(" ")[0].toUpperCase(); // take first name
  const emailPrefix = email.split("@")[0].toUpperCase(); // before @
  const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit number
  return `${base}${randomNum}`;
}

// @desc Register user
// @route POST /api/auth/register
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role, referralCode: providedReferral } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please include all fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate unique referral code
  let referralCode = generateReferralCode(name, email);
  while (await User.findOne({ referralCode })) {
    referralCode = generateReferralCode(name, email);
  }

  // Start transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  
  try {
    let referredBy: mongoose.Schema.Types.ObjectId | undefined;
    let referrer: any = null;

    // 🔹 Create the new user first (signup bonus included)
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
      referralCode,
      profitWallet: 20, // signup bonus
    });

    await user.save({ session });

    // Log signup bonus transaction
    await Transaction.create(
      [
        {
          user: user._id,
          type: "bonus",
          bonusType: "signup",
          amount: 20,
          status: "success",
        },
      ],
      { session }
    );

    // 🔹 Handle referral AFTER user creation is successful
    if (providedReferral) {
      referrer = await User.findOne({ referralCode: providedReferral }).session(session);

      if (referrer) {
        referredBy = referrer._id as mongoose.Schema.Types.ObjectId;
        user.referredBy = referredBy;

        // Add referral bonus to referrer
        const referralBonusAmount = 20;
        referrer.profitWallet += referralBonusAmount;
        await referrer.save({ session });
        await user.save({ session }); // update referredBy in user doc

        // Log referral bonus transaction for referrer
        await Transaction.create(
          [
            {
              user: referrer._id,
              type: "bonus",
              bonusType: "referral",
              amount: referralBonusAmount,
              status: "success",
            },
          ],
          { session }
        );
      }
    }

    // ✅ Commit transaction if everything succeeded
    await session.commitTransaction();
    session.endSession();

    console.log("USER FROM DB:", user);

    // Build clean response
    const responseData = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode ?? "",
      referredBy: user.referredBy,
      referralUrl: `${process.env.FRONTEND_URL}/auth/register?ref=${user.referralCode}`,
      token: generateToken(user.id, user.role),
    };

    console.log("REGISTER RESPONSE:", responseData);

    res.status(201).json({
      user: responseData,
      token: responseData.token,
    });
  } catch (err) {
    // ❌ Rollback on error
    await session.abortTransaction();
    session.endSession();
    console.error("Register User Error:", err);
    res.status(500);
    throw new Error("Server error during registration");
  }
});


// @desc Login user
// @route POST /api/auth/login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    console.log("USER FROM DB:", user);

    const referralUrl = `${process.env.FRONTEND_URL}/auth/register?ref=${user.referralCode}`;
    const responseData = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode ?? "",
      referredBy: user.referredBy,
      referralUrl,
      token: generateToken(user.id, user.role),
    };

    // 🔥 Debug log before response
    console.log("LOGIN RESPONSE:", responseData);

    res.status(201).json({
      user: responseData,
      token: responseData.token,
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      res.status(400);
      throw new Error("Please include all fields");
    }

    // check if email exists
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      username,
      email,
      password: hashedPassword,
      role: role || "admin",
    });

    await admin.save();

    res
      .status(201)
      .json({
        message: "Admin registered successfully",
        admin: { id: admin._id, email: admin.email, role: admin.role },
      });
  } catch (error) {
    console.error("Register Admin Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // generate JWT token (ensure `import jwt from 'jsonwebtoken';` or `import * as jwt from 'jsonwebtoken';` is present)
    const expiresIn = (process.env.JWT_EXPIRES ??
      "7d") as SignOptions["expiresIn"];
    const payload = { id: admin._id, role: admin.role, email: admin.email };
    const jwtSecret = process.env.JWT_SECRET as string;
    // ✅ explicitly declare SignOptions
    const options: SignOptions = {
      expiresIn,
    };
    const token = jwt.sign(payload, jwtSecret, options);

    res
      .status(200)
      .json({
        message: "Admin logged in successfully",
        admin: { id: admin._id, email: admin.email, role: admin.role },
        token,
      });
  } catch (error) {
    console.error("Login Admin Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Get profile
// @route GET /api/auth/profile
export const getProfile = asyncHandler(async (req: any, res: Response) => {
  res.json(req.user);
});
