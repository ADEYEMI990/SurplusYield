import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import User from "../models/User";
import Admin from "../models/Admin";

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES || "7d") as SignOptions["expiresIn"],
  });
};

// @desc Register user
// @route POST /api/auth/register
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please include all fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "user",
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc Login user
// @route POST /api/auth/login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
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

    res.status(201).json({ message: "Admin registered successfully", admin: { id: admin._id, email: admin.email, role: admin.role } });
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
    const expiresIn = (process.env.JWT_EXPIRES ?? "7d") as SignOptions['expiresIn'];
    const payload = { id: admin._id, role: admin.role, email: admin.email };
    const jwtSecret = process.env.JWT_SECRET as string;
    // ✅ explicitly declare SignOptions
    const options: SignOptions = {
      expiresIn,
    };
    const token = jwt.sign(payload, jwtSecret, options);

    res.status(200).json({ message: "Admin logged in successfully", admin: { id: admin._id, email: admin.email, role: admin.role }, token });
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
