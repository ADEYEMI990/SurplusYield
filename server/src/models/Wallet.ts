// server/src/models/Wallet.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IWallet extends Document {
  user: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  transactions: mongoose.Types.ObjectId[];
}

const WalletSchema = new Schema<IWallet>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    transactions: [{ type: Schema.Types.ObjectId, ref: "Transaction" }],
  },
  { timestamps: true }
);

export default mongoose.model<IWallet>("Wallet", WalletSchema);
