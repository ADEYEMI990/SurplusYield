// client/src/types/transaction.ts
import type { Plan } from "./plan";

export interface Transaction {
  _id: string;
  user: string;
  plan?: Plan;
  type: "deposit" | "withdrawal" | "investment" | "bonus";
  amount: number;
  status: "pending" | "success" | "failed";
  currency: "USD" | "NGN" | string;
  bonusType?: "investment" | "referral";
  createdAt: string;
  updatedAt: string;
  roiEarned?: number;
  durationInDays?: number;
}