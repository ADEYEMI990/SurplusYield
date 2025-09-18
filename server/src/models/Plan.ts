// server/src/models/Plan.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IPlan extends Document {
  name: string;
  description?: string;
  minAmount: number;
  maxAmount: number;
  profitPercentage: number; // e.g. 10 means 10%
  durationInDays: number;   // investment length
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const planSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number, required: true },
    profitPercentage: { type: Number, required: true },
    durationInDays: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Plan = mongoose.model<IPlan>("Plan", planSchema);
