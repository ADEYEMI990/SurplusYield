// src/components/user/Plans.tsx
"use client";
import { useEffect, useState } from "react";
import API from "../../lib/api";
import Card from "../common/Card";
import Button from "../common/Button";
import Select from "../common/Select";
import Loader from "../common/Loader";
import { Check, X, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import type { Transaction } from "../../types/transaction";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

interface Plan {
  _id: string;
  icon?: string;
  name: string;
  badge: string;
  planType: string;
  amount?: number;
  roiValue?: number;
  roiUnit: string;
  returnPeriod: string;
  capitalBack: boolean;
  returnType: string;
  durationInDays: number;
  featured?: boolean;
  canCancel?: boolean;
  trending?: boolean;
  status: string;
  minAmount?: number;
  maxAmount?: number;
  minRoi?: number;
  maxRoi?: number;
  holidays?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default function UserPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [balances, setBalances] = useState({ mainWallet: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  const getProgressClass = (percent: number) => {
    if (percent >= 100) return "w-full";
    if (percent >= 75) return "w-3/4";
    if (percent >= 50) return "w-1/2";
    if (percent >= 25) return "w-1/4";
    return "w-0";
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await API.get<Transaction[]>("/transactions/my");
        setTransactions(data.filter((t) => t.type === "investment"));
      } catch (err) {
        console.error("Error fetching investments:", err);
      }
    };
    fetchTransactions();
  }, []);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const { data } = await API.get("/transactions/balances");
        setBalances(data);
      } catch {
        toast.error("Failed to load balances ❌");
      }
    };
    fetchBalances();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const res = await API.get("/plans");
        setPlans(res.data.filter((p: Plan) => p.status === "active"));
      } catch {
        toast.error("Failed to load plans ❌");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleInvestNow = (plan: Plan) => {
    setSelectedPlan(plan);
    setAmount(plan.amount || 0);
    setShowDropdown(true);
  };

  const isValidAmount =
    selectedPlan &&
    amount > 0 &&
    (selectedPlan.planType === "fixed"
      ? amount === selectedPlan.amount
      : amount >= (selectedPlan.minAmount ?? 0) &&
        amount <= (selectedPlan.maxAmount ?? Infinity));

  // ✅ Update your input handler
  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, ""); // Remove commas
    const numericValue = Number(rawValue);
    if (!isNaN(numericValue)) setAmount(numericValue);
  };

  // ✅ Format amount with commas
  const formatWithCommas = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const handleConfirmInvestment = async () => {
    if (!selectedPlan) {
      toast.error("Please select an investment plan.");
      return;
    }

    // Ensure user entered an amount
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter an amount to invest.");
      return;
    }

    const enteredAmount = Number(amount);
    const walletBalance = balances.mainWallet;

    // Determine allowed range for plan
    let min = 0;
    let max = Infinity;

    if (selectedPlan.planType === "fixed" && selectedPlan.amount) {
      min = selectedPlan.amount;
      max = selectedPlan.amount;
    } else if (
      selectedPlan.planType === "range" &&
      selectedPlan.minAmount !== undefined &&
      selectedPlan.maxAmount !== undefined
    ) {
      min = selectedPlan.minAmount;
      max = selectedPlan.maxAmount;
    }

    // 💬 Validate against plan limits
    if (enteredAmount < min || enteredAmount > max) {
      toast.error(
        `Please enter an amount within this plan’s range: $${min} - $${max}.`
      );
      return;
    }

    // 💰 Check wallet balance
    if (enteredAmount > walletBalance) {
      toast.error("Insufficient balance in your Main Wallet.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        planId: selectedPlan._id,
        amount: enteredAmount,
        walletType: "main",
        type: "investment",
      };

      console.log("🪙 Submitting investment payload:", payload);

      const res = await API.post("/transactions", payload);

      toast.success(res.data.message || "Investment successful! 🎉");
      setShowDropdown(false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("❌ Investment failed:", error);
      toast.error(
        error?.response?.data?.message || "Investment failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getReadablePeriod = (plan: Plan) => {
    const { returnPeriod, durationInDays } = plan;
    const period =
      returnPeriod === "hour"
        ? "hour"
        : returnPeriod === "daily"
          ? "day"
          : "week";
    const duration =
      returnPeriod === "weekly"
        ? `${durationInDays / 7} weeks`
        : `${durationInDays} days`;
    return `Pays every 1 ${period} for ${duration}`;
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <button
          title="Go Back"
          onClick={() => navigate("/user/dashboard")}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-center w-full">
          💼 Investment Plans
        </h1>
      </div>

      {/* ==== PLAN CARDS ==== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan._id}
            className="bg-white/70 backdrop-blur-md shadow-md hover:shadow-lg border border-gray-200 transition-all duration-200 rounded-2xl p-6"
          >
            <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 text-xs rounded-full uppercase">
              {plan.badge}
            </div>

            <div className="flex flex-col items-center text-center gap-3">
              {plan.icon && (
                <img
                  src={plan.icon}
                  alt={plan.name}
                  className="w-14 h-14 rounded-full border border-gray-300"
                />
              )}
              <h2 className="text-lg font-semibold text-gray-900">
                {plan.name}
              </h2>
              <p className="text-gray-600 text-sm">
                {plan.roiValue}
                {plan.roiUnit} every {plan.returnPeriod}
              </p>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Investment:</span>
                <span>
                  {plan.planType === "fixed"
                    ? `$${plan.amount}`
                    : `$${plan.minAmount} - $${plan.maxAmount}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Capital Back:</span>
                <span>{plan.capitalBack ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span>Return Type:</span>
                <span>{plan.returnType}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{plan.durationInDays} days</span>
              </div>
              <div className="flex justify-between">
                <span>Cancelable:</span>
                <span>{plan.canCancel ? "Yes" : "No"}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-3 italic text-center">
              {getReadablePeriod(plan)}
            </p>

            <div className="flex justify-center mt-6">
              <Button
                variant="primary"
                size="md"
                className="rounded-full w-full flex sm:w-auto items-center gap-2"
                onClick={() => handleInvestNow(plan)}
              >
                <Check size={16} /> Invest Now
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* ==== CONFIRM INVESTMENT CARD ==== */}
      {showDropdown && selectedPlan && (
        <div className="mt-10 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-xl p-6 sm:p-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center text-gray-900">
            Confirm Investment
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Plan:</span>
              <span className="font-medium">{selectedPlan.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span>{selectedPlan.planType}</span>
            </div>
            <div className="flex justify-between">
              <span>Capital Back:</span>
              <span>{selectedPlan.capitalBack ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>{selectedPlan.durationInDays} days</span>
            </div>
            <div className="flex justify-between">
              <span>Profit Holiday:</span>
              <span>No</span>
            </div>
            <div className="flex justify-between">
              <span>Return of Interest:</span>
              <span>
                {selectedPlan.returnPeriod} — {selectedPlan.roiValue}
                {selectedPlan.roiUnit}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span>
                {selectedPlan.planType === "fixed" && selectedPlan.amount
                  ? `$${selectedPlan.amount}`
                  : selectedPlan.planType === "range" &&
                      selectedPlan.minAmount !== undefined &&
                      selectedPlan.maxAmount !== undefined
                    ? `$${selectedPlan.minAmount} - $${selectedPlan.maxAmount}`
                    : "N/A"}
              </span>
            </div>
            {/* <div className="flex justify-between items-center sm:col-span-2">
              <span>Enter Amount:</span>
              <input
                placeholder="Enter amount"
                type="text"
                value={formatWithCommas(amount)}
                onChange={handleAmountChange}
                className={`w-32 sm:w-40 border rounded-lg px-3 py-2 text-right focus:ring-2 ${
                  isValidAmount ? "focus:ring-green-500" : "focus:ring-red-400"
                }`}
              />
            </div> */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:col-span-2 gap-2">
              <span className="font-medium text-gray-700">Enter Amount:</span>
              <div className="flex flex-col items-end w-full sm:w-auto">
                <input
                  placeholder="Enter amount"
                  type="text"
                  value={formatWithCommas(amount)}
                  onChange={handleAmountChange}
                  className={`w-full sm:w-48 border rounded-lg px-3 py-2 text-right font-medium transition-all duration-200 ${
                    amount === 0
                      ? "border-gray-300 focus:ring-gray-200"
                      : isValidAmount
                        ? "border-green-500 focus:ring-green-300"
                        : "border-red-500 focus:ring-red-300"
                  }`}
                />
                <p
                  className={`text-xs mt-1 text-right transition-all duration-200 ${
                    amount === 0
                      ? "text-gray-500"
                      : isValidAmount
                        ? "text-green-600"
                        : "text-red-600"
                  }`}
                >
                  {amount === 0
                    ? "Enter an amount to continue"
                    : isValidAmount
                      ? "✅ Amount is valid"
                      : selectedPlan?.planType === "fixed"
                        ? `❌ Must be exactly $${formatWithCommas(selectedPlan.amount ?? 0)}`
                        : `❌ Must be between $${formatWithCommas(
                            selectedPlan?.minAmount ?? 0
                          )} and $${formatWithCommas(selectedPlan?.maxAmount ?? 0)}`}
                </p>
              </div>
            </div>

            <div className="flex justify-between sm:col-span-2">
              <span>Wallet:</span>
              <Select
                options={[
                  {
                    value: "main",
                    label: `Main Wallet — $${balances.mainWallet.toLocaleString()}`,
                  },
                ]}
              />
            </div>
            <div className="flex justify-between">
              <span>Total Investment Amount:</span>
              <span>${formatWithCommas(amount)}</span>
            </div>
          </div>

          <div className="flex flex-row justify-center gap-4 mt-6">
            <Button
              variant="primary"
              className="rounded-full w-full flex sm:w-auto items-center gap-2"
              onClick={handleConfirmInvestment}
              loading={loading}
              disabled={!isValidAmount || loading}
            >
              <Check size={16} /> Confirm & Invest
            </Button>
            <Button
              variant="outline"
              className="rounded-full w-full flex sm:w-auto items-center gap-2"
              onClick={() => setShowDropdown(false)}
              disabled={loading}
            >
              <X size={16} /> Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ==== TRANSACTION LOGS ==== */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Investment Logs
        </h2>

        {transactions.length === 0 ? (
          <div className="border border-gray-300 rounded-lg p-6 text-center text-gray-500 bg-white/70">
            No investments yet.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl shadow-md">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  {/* Hidden on mobile */}
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    Icon
                  </th>

                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">ROI</th>
                  <th className="px-4 py-3 text-left">Period Remaining</th>

                  {/* Hidden on mobile */}
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    Profit
                  </th>

                  <th className="px-4 py-3 text-left">Capital Back</th>

                  {/* Hidden on mobile */}
                  <th className="px-4 py-3 text-left hidden md:table-cell">
                    Timeline
                  </th>

                  <th className="px-4 py-3 text-left">Total Earned</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((txn) => {
                  const plan = txn.plan || ({} as Partial<Plan>);
                  const roi =
                    plan.roiValue && plan.roiUnit
                      ? `${plan.roiValue}${plan.roiUnit}`
                      : "N/A";

                  const profit =
                    txn.amount && plan.roiValue && plan.roiUnit === "%"
                      ? ((txn.amount * plan.roiValue) / 100).toFixed(2)
                      : plan.roiUnit === "$"
                        ? plan.roiValue
                        : 0;

                  const startDate = new Date(txn.createdAt);
                  const now = new Date();
                  const durationDays = plan.durationInDays || 0;

                  // handle period type
                  let totalPeriodMs = durationDays * 24 * 60 * 60 * 1000;
                  if (plan.returnPeriod === "hour") {
                    totalPeriodMs = durationDays * 24 * 60 * 60 * 1000; // same logic, but timeline runs hourly
                  } else if (plan.returnPeriod === "weekly") {
                    totalPeriodMs = durationDays * 24 * 60 * 60 * 1000; // usually weekly also based on days
                  }

                  const elapsedMs = now.getTime() - startDate.getTime();
                  const remainingMs = Math.max(totalPeriodMs - elapsedMs, 0);

                  // Convert remaining to days/hours/minutes
                  const remainingDays = Math.floor(
                    remainingMs / (1000 * 60 * 60 * 24)
                  );
                  const remainingHours = Math.floor(
                    (remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                  );
                  const remainingMinutes = Math.floor(
                    (remainingMs % (1000 * 60 * 60)) / (1000 * 60)
                  );

                  const percentDone = Math.min(
                    (elapsedMs / totalPeriodMs) * 100,
                    100
                  );

                  return (
                    <tr
                      key={txn._id}
                      className="border-t hover:bg-gray-50 transition text-gray-800"
                    >
                      {/* Hidden on mobile */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        {plan.icon ? (
                          <img
                            src={plan.icon}
                            alt={plan.name}
                            className="w-8 h-8 rounded-full border"
                          />
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {plan.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${txn.amount} —{" "}
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-4 py-3">{roi}</td>

                      <td className="px-4 py-3 text-red-600 font-semibold">
                        {remainingDays}d {remainingHours}h
                      </td>

                      {/* Hidden on mobile */}
                      <td className="px-4 py-3 text-green-600 hidden md:table-cell">
                        ${profit}
                      </td>

                      <td className="px-4 py-3">
                        {plan.capitalBack ? "Yes" : "No"}
                      </td>

                      {/* Hidden on mobile */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="text-xs text-gray-600">
                          {remainingDays}D:{remainingHours}H:{remainingMinutes}M
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`bg-green-500 h-2 rounded-full transition-all duration-300 ${getProgressClass(
                              percentDone
                            )}`}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {percentDone.toFixed(0)}%
                        </div>
                      </td>

                      <td className="px-4 py-3 font-medium text-gray-900">
                        ${txn.roiEarned || 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
