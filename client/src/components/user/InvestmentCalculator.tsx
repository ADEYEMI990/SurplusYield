// src/components/user/InvestmentCalculator.tsx
import { useEffect, useState } from "react";
import Card from "../common/Card";
import { CardContent, CardHeader, CardTitle } from "../common/Card";
import { Calculator } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../lib/api";
import type { AxiosError } from "axios";

interface Plan {
  _id: string;
  name: string;
  status: string;
  planType: "fixed" | "range";
  amount?: number;
  minAmount?: number;
  maxAmount?: number;
  roiValue: number;
  roiUnit: "%" | "$";
  returnPeriod: "hour" | "daily" | "weekly" | "monthly";
  durationInDays: number;
}

interface ErrorResponse {
  message?: string;
}

export default function InvestmentCalculator() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [days, setDays] = useState<number>(1);
  const [projected, setProjected] = useState<number>(0);

  // Fetch plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const { data } = await API.get("/plans");
        const active = data.filter((p: Plan) => p.status === "active");
        setPlans(active);
      } catch (err) {
        const error = err as AxiosError<ErrorResponse>;
        toast.error(error.response?.data?.message || "Failed to load plans ❌");
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  // Calculate projected earnings
  useEffect(() => {
    if (!selectedPlan || !amount || !days) {
      setProjected(0);
      return;
    }

    const roiValue = selectedPlan.roiValue;
    const roiUnit = selectedPlan.roiUnit;
    const returnPeriod = selectedPlan.returnPeriod;

    let totalReturn = 0;

    if (roiUnit === "%") {
      let dailyRate = 0;

      switch (returnPeriod) {
        case "hour":
          // 24 cycles per day
          dailyRate = roiValue * 24;
          break;
        case "daily":
          dailyRate = roiValue;
          break;
        case "weekly":
          // 1 week = 7 days, so daily = ROI / 7
          dailyRate = roiValue / 7;
          break;
        case "monthly":
          // 1 month ~ 30 days
          dailyRate = roiValue / 30;
          break;
        default:
          dailyRate = 0;
      }

      const totalPercentage = dailyRate * days;
      totalReturn = (amount * totalPercentage) / 100;
    } else if (roiUnit === "$") {
      // Fixed dollar ROI per return period
      let multiplier = 0;
      switch (returnPeriod) {
        case "hour":
          multiplier = 24 * days;
          break;
        case "daily":
          multiplier = days;
          break;
        case "weekly":
          multiplier = days / 7;
          break;
        case "monthly":
          multiplier = days / 30;
          break;
      }
      totalReturn = roiValue * multiplier;
    }

    setProjected(totalReturn);
  }, [selectedPlan, amount, days]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!isNaN(val)) setAmount(val);
  };

  const withinRange =
    selectedPlan &&
    (selectedPlan.planType === "fixed"
      ? amount === selectedPlan.amount
      : amount >= (selectedPlan.minAmount ?? 0) &&
        amount <= (selectedPlan.maxAmount ?? Infinity));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" /> Investment Calculator
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loadingPlans ? (
          <p>Loading plans...</p>
        ) : (
          <div className="space-y-4">
            {/* Select Plan */}
            <div>
              <label className="text-sm font-medium">Select Plan</label>
              <select
                title="Select Plan"
                className="w-full border rounded-md px-3 py-2 mt-1"
                value={selectedPlan?._id || ""}
                onChange={(e) => {
                  const plan = plans.find((p) => p._id === e.target.value);
                  setSelectedPlan(plan || null);
                  setAmount(plan?.amount || 0);
                  setProjected(0);
                }}
              >
                <option value="">-- Choose a plan --</option>
                {plans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan info */}
            {selectedPlan && (
              <div className="bg-gray-50 border rounded-md p-3 text-sm space-y-1">
                <p>
                  <strong>Investment:</strong>{" "}
                  {selectedPlan.planType === "fixed"
                    ? `$${selectedPlan.amount}`
                    : `$${selectedPlan.minAmount} - $${selectedPlan.maxAmount}`}
                </p>
                <p>
                  <strong>ROI:</strong> {selectedPlan.roiValue}
                  {selectedPlan.roiUnit} / {selectedPlan.returnPeriod}
                </p>
                <p>
                  <strong>Duration:</strong> {selectedPlan.durationInDays} days
                </p>
              </div>
            )}

            {/* Amount */}
            {selectedPlan && (
              <div>
                <label className="text-sm font-medium">Enter Amount</label>
                <input
                  title="Amount"
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  className={`w-full border rounded-md px-3 py-2 mt-1 ${
                    withinRange
                      ? "border-green-500 focus:ring-green-500"
                      : "border-red-500 focus:ring-red-500"
                  }`}
                />
                {!withinRange && (
                  <p className="text-xs text-red-500 mt-1">
                    Amount must be within{" "}
                    {selectedPlan.planType === "fixed"
                      ? `$${selectedPlan.amount}`
                      : `$${selectedPlan.minAmount} - $${selectedPlan.maxAmount}`}
                  </p>
                )}
              </div>
            )}

            {/* Days */}
            {selectedPlan && (
              <div>
                <label className="text-sm font-medium">Days to Calculate</label>
                <input
                  title="Days"
                  type="number"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full border rounded-md px-3 py-2 mt-1"
                />
              </div>
            )}

            {/* Result */}
            {selectedPlan && withinRange && (
              <div className="mt-4 p-3 border rounded-md bg-green-50 text-green-800">
                <p className="text-sm font-medium">Projected Earnings:</p>
                <p className="text-xl font-bold">
                  ${projected.toFixed(2)}{" "}
                  <span className="text-gray-500 text-sm">
                    after {days} day{days > 1 ? "s" : ""}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
