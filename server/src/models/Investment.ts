// models/Investment.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IInvestment extends Document {
  user: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  amount: number;
  initialAmount: number;
  roiRate: number; // e.g., 5% per period
  roiInterval: "daily" | "weekly" | "monthly";
  roiType: "flat" | "compounded";
  startDate: Date;
  endDate: Date;
  lastCredited: Date;
  status: "active" | "completed";
}

const investmentSchema = new Schema<IInvestment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },
    amount: { type: Number, required: true },
    initialAmount: { type: Number, required: true },
    roiRate: { type: Number, required: true },
    roiInterval: { type: String, enum: ["daily", "weekly", "monthly"], default: "daily" },
    roiType: { type: String, enum: ["flat", "compounded"], default: "flat" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    lastCredited: { type: Date },
    status: { type: String, enum: ["active", "completed"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model<IInvestment>("Investment", investmentSchema);
