import mongoose, { Document, Schema } from "mongoose";

export type SpotlightType = "investment" | "withdraw";

export interface ISpotlight extends Document {
  type: SpotlightType;
  title: string;
  subtitle?: string;
  date?: Date;
  status?: string; // e.g., Active, Pending, Completed
  net?: string; // e.g., "+0 USD"
  total?: string; // e.g., "10000 USD"
  amount?: number; // numeric amount for sorting or calculations
  meta?: Record<string, any>;
  order?: number;
  createdBy?: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SpotlightSchema = new Schema<ISpotlight>(
  {
    type: { type: String, enum: ["investment", "withdraw"], required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    date: { type: Date },
    status: { type: String },
    net: { type: String },
    total: { type: String },
    amount: { type: Number },
    meta: { type: Schema.Types.Mixed },
    order: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Spotlight = mongoose.model<ISpotlight>("Spotlight", SpotlightSchema);
export default Spotlight;