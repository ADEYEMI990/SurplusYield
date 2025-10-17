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
import landingRoutes from "./routes/site/landingRoutes";
import pageRoutes from "./routes/site/pageRoutes";
import navigationRoutes from "./routes/site/navigationRoutes";
import footerRoutes from "./routes/site/footerRoutes";
import userRoutes from "./routes/userRoutes";
import "./jobs/roiJob";
import { notFound, errorHandler } from "./middleware/errorMiddleware";
import path from "path";
import kycRoutes from "./routes/KycRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import walletRoutes from "./routes/walletRoutes";
import withdrawWalletRoutes from "./routes/withdrawWalletRoutes";
import notificationRoutes from "./routes/notificationRoutes";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/referrals", adminReferralRoutes);
app.use("/api/admin/rewards", adminRewardRoutes);
app.use("/api/admin/settings", adminSettingRoutes);
app.use("/api/admin/templates", adminTemplateRoutes);
app.use("/api/site/landing", landingRoutes);
app.use("/api/site/pages", pageRoutes);
app.use("/api/site/navigation", navigationRoutes);
app.use("/api/site/footer", footerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/withdraw-wallet", withdrawWalletRoutes);
app.use("/api/notifications", notificationRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
