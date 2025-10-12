// client/src/types/transaction.ts
import type { Plan } from "./plan";

export interface Transaction {
  _id: string;
  user: string;
  plan?: Plan;
  type: "deposit" | "withdrawal" | "investment" | "profit" | "roi" | "capitalReturn" | "bonus";
  amount: number;
  status: "pending" | "success" | "failed";
  isCompleted?: boolean;
  currency: "USD" | string;
  bonusType?: "investment" | "referral";
  createdAt: string;
  updatedAt: string;
  roiEarned?: number;
  durationInDays?: number;
}