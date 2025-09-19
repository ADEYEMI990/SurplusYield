import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import planRoutes from "./routes/planRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import adminRoutes from "./routes/adminRoutes";
import adminReferralRoutes from "./routes/adminReferralRoutes";
import adminRewardRoutes from "./routes/adminRewardRoutes";
import adminSettingRoutes from "./routes/adminSettingRoutes";
import adminTemplateRoutes from "./routes/adminTemplateRoutes";
import { notFound, errorHandler } from "./middleware/errorMiddleware";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/referrals", adminReferralRoutes);
app.use("/api/admin/rewards", adminRewardRoutes);
app.use("/api/admin/settings", adminSettingRoutes);
app.use("/api/admin/templates", adminTemplateRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
