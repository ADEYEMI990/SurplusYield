// client/src/services/transactionService.ts

import API from "../lib/api";

export interface Transaction {
  _id: string;
  user: { email: string };
  plan?: { name: string };
  type: "deposit" | "withdrawal" | "investment" | "profit" | "roi" | "bonus";
  amount: number;
  status: "pending" | "completed" | "failed";
  reference: string;
  createdAt: string;
  updatedAt: string;
}

// ✅ Get all transactions (admin)
const getTransactions = async (): Promise<Transaction[]> => {
  const { data } = await API.get("/transactions");
  return data;
};

// ✅ Update status
const updateTransactionStatus = async ({
  id,
  status,
}: {
  id: string;
  status: "completed" | "failed";
}): Promise<Transaction> => {
  const { data } = await API.put(`/transactions/${id}/status`, { status });
  return data;
};

export const transactionService = {
  getTransactions,
  updateTransactionStatus,
};
