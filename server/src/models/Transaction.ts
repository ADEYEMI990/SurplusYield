// server/src/models/Transaction.ts
import mongoose, { Document, Schema } from "mongoose";

export type TransactionType = "deposit" | "withdrawal" | "investment" | "profit" | "roi" | "bonus";
export type TransactionStatus = "pending" | "success" | "failed";

export type BonusType = "referral" | "deposit" | "investment" | "signup";

export interface ITransaction extends Document {
  user: mongoose.Schema.Types.ObjectId;
  plan?: mongoose.Schema.Types.ObjectId; // linked if it's an investment
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  reference: string; // unique transaction reference
  createdAt: Date;
  updatedAt: Date;
  bonusType?: BonusType;
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
    bonusType: {
      type: String,
      enum: ["referral", "deposit", "investment", "signup"],
      required: function (this: ITransaction) {
        return this.type === "bonus"; // ✅ only required if type = bonus
      },
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    reference: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

// ✅ Auto-generate reference before validation if missing
transactionSchema.pre("validate", function (next) {
  if (!this.reference) {
    const base = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    if (this.bonusType === "signup") {
      this.reference = `${base}-SIGNUP`;
    } else if (this.bonusType === "referral") {
      this.reference = `${base}-REFERRAL`;
    } else {
      this.reference = base;
    }
  }
  next();
})

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
