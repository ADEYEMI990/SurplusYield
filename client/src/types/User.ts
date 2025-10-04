// client/src/types/User.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  referralCode?: string;   // from backend
  referralUrl?: string;    // you can compute this in backend or frontend
  mainWallet: number;
  profitWallet: number;
  token?: string;
}
