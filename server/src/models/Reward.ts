// server/src/models/Reward.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IReward extends Document {
  user: mongoose.Schema.Types.ObjectId;
  type: "earning" | "redeem";
  points: number;
  createdAt: Date;
}

const rewardSchema = new Schema<IReward>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["earning", "redeem"], required: true },
    points: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Reward = mongoose.model<IReward>("Reward", rewardSchema);
