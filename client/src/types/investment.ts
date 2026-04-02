import type { Plan } from "./plan";

export interface Investment {
  id: string;
  amount: number;
  initialAmount: number;
  roiRate: number;
  roiEarned: number;
  status: string;
  createdAt: string;
  plan: Plan;
}