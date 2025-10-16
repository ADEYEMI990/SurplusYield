import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
  address: string;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    address: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IWallet>("Wallet", walletSchema);
