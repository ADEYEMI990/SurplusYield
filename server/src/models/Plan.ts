// server/src/models/Plan.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IPlan extends Document {
  icon?: string; // image url
  name: string;
  badge: string;
  planType: "fixed" | "range";
  minAmount?: number;
  maxAmount?: number;
  amount?: number;
  roiType: "fixed" | "range";
  roiValue?: number;
  minRoi?: number;
  maxRoi?: number;
  roiUnit: "%" | "$";
  returnPeriod: "hour" | "daily" | "weekly";
  returnType: "period" | "lifetime";
  numOfPeriods?: number;
  holidays?: string[]; // e.g. ["saturday", "sunday"]
  capitalBack: boolean;
  featured: boolean;
  canCancel: boolean;
  trending: boolean;
  status: "active" | "deactivated";
  createdAt: Date;
  updatedAt: Date;
  durationInDays?: number; // new field for plan duration
}

const planSchema = new Schema<IPlan>(
  {
    icon: { type: String },
    name: { type: String, required: true, unique: true },
    badge: { type: String, required: true },
    planType: { type: String, enum: ["fixed", "range"], default: "range" },
    amount: { type: Number },
    minAmount: { type: Number },
    maxAmount: { type: Number },
    roiType: { type: String, enum: ["fixed", "range"], default: "range" },
    roiValue: { type: Number },
    minRoi: { type: Number },
    maxRoi: { type: Number },
    roiUnit: { type: String, enum: ["%", "$"], default: "%" },
    returnPeriod: { type: String, enum: ["hour", "daily", "weekly"], default: "daily" },
    returnType: { type: String, enum: ["period", "lifetime"], default: "period" },
    numOfPeriods: { type: Number },
    holidays: [{ type: String, enum: ["saturday", "sunday"] }],
    capitalBack: { type: Boolean, default: true },
    featured: { type: Boolean, default: true },
    canCancel: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "deactivated"], default: "active" },
    durationInDays: { type: Number, required: false },
  },
  { timestamps: true }
);

export const Plan = mongoose.model<IPlan>("Plan", planSchema);

