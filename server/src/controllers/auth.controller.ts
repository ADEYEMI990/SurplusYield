import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import prisma from "../lib/prisma";

import { sendNotification } from "../utils/notify";
import { getReference } from "../utils/getReference";

// Helper: strong password validation
function isStrongPassword(password: string): boolean {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

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
export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    let {
      name,
      email,
      password,
      role,
      referralCode: providedReferral,
    } = req.body;
    email = email.toLowerCase().trim();
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please include all fields");
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      res.status(400);
      throw new Error(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      );
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique referral code
    let referralCode = generateReferralCode(name, email);
    while (await prisma.user.findUnique({ where: { referralCode } })) {
      referralCode = generateReferralCode(name, email);
    }

    try {
      // Create user with signup bonus
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || "user",
          referralCode,
        },
      });

      // Log signup bonus transaction
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "bonus",
          bonusType: "signup",
          amount: 20,
          status: "success",
          reference: getReference(),
        },
      });

      await sendNotification(
        String(user.id),
        "Welcome to CashAppInvest!",
        "Your account has been created successfully, and a signup bonus of $20 has been credited to your profit wallet."
      );

      // Handle referral
      if (providedReferral) {
        const referrer = await prisma.user.findUnique({ where: { referralCode: providedReferral } });
        if (referrer) {
          const referralBonusAmount = 20;
          
          await prisma.user.update({
            where: { id: user.id },
            data: { referredBy: referrer.id },
          });
          await prisma.transaction.create({
            data: {
              userId: referrer.id,
              type: "bonus",
              bonusType: "referral",
              amount: referralBonusAmount,
              status: "success",
              reference: getReference(),
            },
          });
          await sendNotification(
            String(referrer.id),
            "Referral Bonus Earned!",
            `You have earned a referral bonus of $${referralBonusAmount} for referring a new user.`
          );
        }
      }

      // Build clean response
      const responseData = {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode ?? "",
        referredBy: user.referredBy,
        referralUrl: `${process.env.FRONTEND_URL}/auth/register?ref=${user.referralCode}`,
        token: generateToken(user.id, user.role),
      };

      res.status(201).json({
        user: responseData,
        token: responseData.token,
      });
    } catch (err) {
      console.error("Register User Error:", err);
      res.status(500);
      throw new Error("Server error during registration");
    }
  }
);

// @desc Login user
// @route POST /api/auth/login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  let { email, password } = req.body;
  email = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && (await bcrypt.compare(password, user.password))) {
    const referralUrl = `${process.env.FRONTEND_URL}/auth/register?ref=${user.referralCode}`;
    const responseData = {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode ?? "",
      referredBy: user.referredBy,
      referralUrl,
      token: generateToken(user.id, user.role),
    };
    res.status(201).json({
      user: responseData,
      token: responseData.token,
    });
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});

// @desc Change password
// @route PUT /api/user/change-password
// @access Private (User)
export const changePassword = asyncHandler(async (req: any, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    res.status(400);
    throw new Error("Both old and new passwords are required");
  }

  // Validate new password strength
  if (!isStrongPassword(newPassword)) {
    res.status(400);
    throw new Error(
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
    );
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  // Verify old password
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const newHashed = await bcrypt.hash(newPassword, salt);
  await prisma.user.update({ where: { id: user.id }, data: { password: newHashed } });
  await sendNotification(
    String(user.id),
    "Password Changed",
    "Your account password has been updated successfully.",
    "security"
  );
  res.status(200).json({ message: "Password changed successfully" });
});

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    let { username, email, password, role } = req.body;
    email = email.toLowerCase().trim();

    if (!username || !email || !password) {
      res.status(400);
      throw new Error("Please include all fields");
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      res.status(400);
      throw new Error(
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      );
    }

    // check if email exists
    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || "admin",
      },
    });
    res.status(201).json({
      message: "Admin registered successfully",
      admin: { id: admin.id, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.error("Register Admin Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const expiresIn = (process.env.JWT_EXPIRES ?? "7d") as SignOptions["expiresIn"];
    const payload = { id: admin.id, role: admin.role, email: admin.email };
    const jwtSecret = process.env.JWT_SECRET as string;
    const options: SignOptions = { expiresIn };
    const token = jwt.sign(payload, jwtSecret, options);
    res.status(200).json({
      message: "Admin logged in successfully",
      admin: { id: admin.id, email: admin.email, role: admin.role },
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
