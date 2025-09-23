// client/src/services/planServices.ts
import API from "../lib/api";

export interface Plan {
  _id?: string;
  name: string;
  description?: string;
  minAmount: number;
  maxAmount: number;
  roiRate: number;
  roiInterval: "daily" | "weekly" | "monthly";
  roiType: "flat" | "compounded";
  profitPercentage: number;
  durationInDays: number;
}

const API_URL = "/plans";

export const planService = {
  getPlans: async (): Promise<Plan[]> => {
    const { data } = await API.get(API_URL);
    return Array.isArray(data) ? data : data.plans || [];
  },
  createPlan: async (payload: Plan) => {
    const { data } = await API.post(API_URL, payload);
    return data;
  },
  updatePlan: async (id: string, payload: Plan) => {
    const { data } = await API.put(`${API_URL}/${id}`, payload);
    return data;
  },
  deletePlan: async (id: string) => {
    const { data } = await API.delete(`${API_URL}/${id}`);
    return data;
  },
};