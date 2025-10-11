// client/src/types/plan.ts
export interface Plan {
  _id?: string;
  name: string;
  badge: string;
  planType: "fixed" | "range";
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
  roiType: "fixed" | "range";
  roiValue?: number;
  minRoi?: number;
  maxRoi?: number;
  roiUnit: "%" | "$";
  returnPeriod: "hour" | "daily" | "weekly";
  returnType: "period" | "lifetime";
  durationInDays: number;
  holidays: string[];
  capitalBack: boolean;
  featured: boolean;
  canCancel: boolean;
  trending: boolean;
  status: "active" | "deactivated";
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}