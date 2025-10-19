// src/components/landing/LandingCalculator.tsx
import { useEffect, useState } from "react";
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

export default function LandingCalculator() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [days, setDays] = useState<number>(1);
  const [projected, setProjected] = useState<number>(0);

  // Fetch live plans from backend
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

  // ROI calculation (same logic)
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
          dailyRate = roiValue * 24;
          break;
        case "daily":
          dailyRate = roiValue;
          break;
        case "weekly":
          dailyRate = roiValue / 7;
          break;
        case "monthly":
          dailyRate = roiValue / 30;
          break;
      }
      const totalPercentage = dailyRate * days;
      totalReturn = (amount * totalPercentage) / 100;
    } else if (roiUnit === "$") {
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
    <section className="w-full bg-gradient-to-b from-white to-blue-50 py-16" id="calculator">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full p-3 mb-4">
            <Calculator className="w-6 h-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Investment Calculator
          </h2>
          <p className="text-gray-600 mt-2">
            Estimate your potential returns instantly.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-8 space-y-6 max-w-2xl mx-auto border border-blue-100">
          {loadingPlans ? (
            <p className="text-gray-500 text-center">Loading plans...</p>
          ) : (
            <>
              {/* Select Plan */}
              <div className="text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Select Plan
                </label>
                <select
                title="Select Plan"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
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
                <div className="bg-blue-50 rounded-lg p-4 text-left text-sm text-gray-700 border border-blue-100">
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
                <div className="text-left">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Enter Amount
                  </label>
                  <input
                  title="Amount"
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none ${
                      withinRange
                        ? "border-green-400 focus:ring-green-400"
                        : "border-red-400 focus:ring-red-400"
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
                <div className="text-left">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Days to Calculate
                  </label>
                  <input
                  title="Days"
                    type="number"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
              )}

              {/* Result */}
              {selectedPlan && withinRange && (
                <div className="mt-6 text-left bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-800">
                    Projected Earnings:
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    ${projected.toFixed(2)}{" "}
                    <span className="text-gray-500 text-sm font-normal">
                      after {days} day{days > 1 ? "s" : ""}
                    </span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
