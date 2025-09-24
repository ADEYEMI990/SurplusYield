// server/src/models/Transaction.ts
import mongoose, { Document, Schema } from "mongoose";

export type TransactionType = "deposit" | "withdrawal" | "investment" | "profit";
export type TransactionStatus = "pending" | "completed" | "failed";

export interface ITransaction extends Document {
  user: mongoose.Schema.Types.ObjectId;
  plan?: mongoose.Schema.Types.ObjectId; // linked if it's an investment
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  reference: string; // unique transaction reference
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: Schema.Types.ObjectId, ref: "Plan" },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "investment", "profit", "roi", "bonus"],
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    reference: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// ✅ Auto-generate reference before validation if missing
transactionSchema.pre("validate", function (next) {
  if (!this.reference) {
    this.reference = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }
  next();
})

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
