// server/src/utils/walletUtils.ts
import mongoose from "mongoose";
import User from "../models/User";
import { ITransaction } from "../models/Transaction";

/**
 * Apply a transaction to the user's wallets (atomic when called with a session).
 * Uses $inc to update numeric fields.
 *
 * @param transaction - the transaction that was completed
 * @param session - optional mongoose session to include in a transaction
 */
export async function applyTransactionToWalletAtomic(
  transaction: ITransaction,
  session?: mongoose.ClientSession
): Promise<void> {
  if (!transaction.user) return;

  const inc: Record<string, number> = {};

  switch (transaction.type) {
    case "deposit":
      // deposit increases mainWallet
      inc["mainWallet"] = transaction.amount;
      break;
    case "withdrawal":
      // withdrawal decreases mainWallet
      inc["mainWallet"] = -transaction.amount;
      break;
    case "profit":
    case "roi":
    case "bonus":
      // these increase profitWallet
      inc["profitWallet"] = transaction.amount;
      break;
    default:
      // unknown types: do nothing
      return;
  }

  // Use updateOne with $inc for atomic update. Include session if provided.
  await User.updateOne(
    { _id: transaction.user },
    { $inc: inc },
    { session }
  );
}
