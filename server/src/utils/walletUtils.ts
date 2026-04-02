// server/src/utils/walletUtils.ts

import prisma from "../lib/prisma";


/**
 * Apply a transaction to the user's wallets using Prisma.
 * @param transaction - the transaction that was completed
 *   Should have: { user: userId, type, amount }
 */
export async function applyTransactionToWalletAtomic(
  transaction: { user: string; type: string; amount: number }
): Promise<void> {
  if (!transaction.user) return;

  let data: Record<string, any> = {};
  switch (transaction.type) {
    case "deposit":
      data = { mainWallet: { increment: transaction.amount } };
      break;
    case "withdrawal":
      data = { mainWallet: { decrement: transaction.amount } };
      break;
    case "profit":
    case "roi":
      data = { profitWallet: { increment: transaction.amount } };
      break;
    case "bonus":
      data = { profitWallet: { increment: transaction.amount } };
      break;
    default:
      return;
  }
  await prisma.user.update({
    where: { id: transaction.user },
    data,
  });
}
