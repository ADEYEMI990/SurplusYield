import mongoose, { Schema, Document } from "mongoose";

export interface IWithdrawWallet extends Document {
  userId: mongoose.Types.ObjectId;
  btcAddress: string;
  updatedAt: Date;
}

const withdrawWalletSchema = new Schema<IWithdrawWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    btcAddress: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IWithdrawWallet>("WithdrawWallet", withdrawWalletSchema);
