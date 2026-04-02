// src/components/user/Plans.tsx

"use client";
import { useEffect, useState } from "react";
import API from "../../lib/api";
import Loader from "../common/Loader";
import { Check, X, ArrowLeft, TrendingUp, Wallet, Calendar, Award, Zap, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { Investment } from "../../types/investment";

interface Plan {
  id: string;
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
  const [investments, setInvestments] = useState<Investment[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const { data } = await API.get("/transactions/investments");
        setInvestments(data);
      } catch (err) {
        console.error("Error fetching investments:", err);
      }
    };
    fetchInvestments();
  }, []);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const { data } = await API.get("/transactions/balances");
        setBalances(data);
      } catch (err) {
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

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, "");
    const numericValue = Number(rawValue);
    if (!isNaN(numericValue)) setAmount(numericValue);
  };

  const formatWithCommas = (value: number) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 2 });

  const handleConfirmInvestment = async () => {
    if (!selectedPlan) {
      toast.error("Please select an investment plan.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter an amount to invest.");
      return;
    }

    const enteredAmount = Number(amount);
    const walletBalance = balances.mainWallet;

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

    if (enteredAmount < min || enteredAmount > max) {
      toast.error(
        `Please enter an amount within this plan’s range: $${min} - $${max}.`
      );
      return;
    }

    if (enteredAmount > walletBalance) {
      toast.error("Insufficient balance in your Main Wallet.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        planId: selectedPlan.id,
        amount: enteredAmount,
        type: "investment",
      };

      const res = await API.post("/transactions", payload);

      toast.success(res.data.message || "Investment successful with 10% bonus 🎉");

      const balanceRes = await API.get("/transactions/balances");
      setBalances(balanceRes.data);

      const txRes = await API.get("/transactions/investments");
      setInvestments(txRes.data);

      setShowDropdown(false);
      setAmount(0);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Investment failed:", error);
      toast.error(
        error?.response?.data?.message || "Investment failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    if (planName.toLowerCase().includes("starter")) return <Zap className="w-8 h-8 text-green-500" />;
    if (planName.toLowerCase().includes("standard")) return <TrendingUp className="w-8 h-8 text-green-500" />;
    if (planName.toLowerCase().includes("premium")) return <Award className="w-8 h-8 text-green-500" />;
    return <Wallet className="w-8 h-8 text-green-500" />;
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/user/dashboard")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Investment Plans</h1>
          </div>
          <p className="text-gray-500 text-sm ml-11">Choose a plan that fits your goals</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5 mb-6 shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-green-100 text-sm font-medium">Available Balance</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${balances.mainWallet.toLocaleString()}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-white/80" />
          </div>
          <p className="text-green-100 text-xs">Main Wallet</p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleInvestNow(plan)}
            >
              {/* Badge */}
              <div className="relative">
                <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 text-xs font-semibold rounded-full">
                  {plan.badge}
                </div>
              </div>

              <div className="p-6">
                {/* Icon */}
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  {plan.icon ? (
                    <img src={plan.icon} alt={plan.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    getPlanIcon(plan.name)
                  )}
                </div>

                {/* Plan Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                
                {/* ROI */}
                <div className="mb-4">
                  <p className="text-3xl font-bold text-green-600">
                    {plan.roiValue}{plan.roiUnit}
                  </p>
                  <p className="text-sm text-gray-500">every {plan.returnPeriod}</p>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Investment Range</span>
                    <span className="font-medium text-gray-900">
                      {plan.planType === "fixed"
                        ? `$${plan.amount}`
                        : `$${plan.minAmount} - $${plan.maxAmount}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium text-gray-900">{plan.durationInDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Capital Back</span>
                    <span className={`font-medium ${plan.capitalBack ? "text-green-600" : "text-gray-500"}`}>
                      {plan.capitalBack ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Cancelable</span>
                    <span className={`font-medium ${plan.canCancel ? "text-green-600" : "text-gray-500"}`}>
                      {plan.canCancel ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                <button
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Invest Now <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Confirm Investment Modal */}
        {showDropdown && selectedPlan && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Confirm Investment</h2>
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Plan Summary */}
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedPlan.name}</p>
                      <p className="text-sm text-gray-600">
                        {selectedPlan.roiValue}{selectedPlan.roiUnit} every {selectedPlan.returnPeriod}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Investment Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Amount
                  </label>
                  <input
                    type="text"
                    value={formatWithCommas(amount)}
                    onChange={handleAmountChange}
                    placeholder="Enter amount"
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-colors ${
                      amount === 0
                        ? "border-gray-200"
                        : isValidAmount
                          ? "border-green-500 bg-green-50"
                          : "border-red-500 bg-red-50"
                    }`}
                  />
                  <p className={`text-xs mt-2 ${
                    amount === 0
                      ? "text-gray-500"
                      : isValidAmount
                        ? "text-green-600"
                        : "text-red-600"
                  }`}>
                    {amount === 0
                      ? "Enter an amount to continue"
                      : isValidAmount
                        ? "✅ Amount is valid"
                        : selectedPlan?.planType === "fixed"
                          ? `❌ Must be exactly $${formatWithCommas(selectedPlan.amount ?? 0)}`
                          : `❌ Must be between $${formatWithCommas(selectedPlan?.minAmount ?? 0)} and $${formatWithCommas(selectedPlan?.maxAmount ?? 0)}`}
                  </p>
                </div>

                {/* Investment Details */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plan Type</span>
                    <span className="font-medium text-gray-900 capitalize">{selectedPlan.planType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium text-gray-900">{selectedPlan.durationInDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Capital Back</span>
                    <span className={`font-medium ${selectedPlan.capitalBack ? "text-green-600" : "text-gray-500"}`}>
                      {selectedPlan.capitalBack ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Investment Amount</span>
                    <span className="font-bold text-gray-900">${formatWithCommas(amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bonus (10%)</span>
                    <span className="font-medium text-green-600">+${formatWithCommas(amount * 0.1)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Available Balance</span>
                    <span className="font-semibold text-gray-900">${balances.mainWallet.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleConfirmInvestment}
                    disabled={!isValidAmount || loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Confirm & Invest
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowDropdown(false)}
                    disabled={loading}
                    className="px-6 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Investment Logs Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Active Investments</h2>
            <span className="text-sm text-green-600">{investments.length} active</span>
          </div>

          {investments.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No active investments yet</p>
              <p className="text-sm text-gray-400 mt-1">Start your investment journey today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {investments.map((txn) => {
                const plan = txn.plan || ({} as Partial<Plan>);
                const roi = plan.roiValue && plan.roiUnit
                  ? `${plan.roiValue}${plan.roiUnit}`
                  : "N/A";

                const startDate = new Date(txn.createdAt);
                const now = new Date();
                const durationDays = plan.durationInDays || 0;
                const totalPeriodMs = durationDays * 24 * 60 * 60 * 1000;
                const elapsedMs = now.getTime() - startDate.getTime();
                const remainingMs = Math.max(totalPeriodMs - elapsedMs, 0);
                const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
                const remainingHours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const percentDone = Math.min((elapsedMs / totalPeriodMs) * 100, 100);

                return (
                  <div key={txn.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
                          {plan.icon ? (
                            <img src={plan.icon} alt={plan.name} className="w-8 h-8 rounded-full" />
                          ) : (
                            <TrendingUp className="w-6 h-6 text-green-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-500">
                              Started {new Date(txn.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="font-semibold text-gray-900">${txn.amount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">ROI</p>
                          <p className="font-semibold text-green-600">{roi}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Time Remaining</p>
                          <p className="font-semibold text-gray-900">{remainingDays}d {remainingHours}h</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Earned</p>
                          <p className="font-semibold text-green-600">${Number(txn.roiEarned ?? 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{percentDone.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentDone}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}