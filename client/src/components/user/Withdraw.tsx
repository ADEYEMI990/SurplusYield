// src/components/user/Withdraw.tsx

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../lib/api";
import type { Transaction } from "../../types/transaction";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bitcoin, Wallet, CheckCircle, Clock, AlertCircle, ExternalLink, Copy, TrendingUp } from "lucide-react";

interface Balances {
  mainWallet: number;
  profitWallet: number;
}

export default function Withdraw() {
  const [balances, setBalances] = useState<Balances>({
    mainWallet: 0,
    profitWallet: 0,
  });
  const [step, setStep] = useState<"form" | "btc" | "confirm" | "pending">(
    "form"
  );
  const [walletType, setWalletType] = useState("main");
  const [amount, setAmount] = useState("");
  const [btcAddress, setBtcAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Fetch balances on load
  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const res = await API.get("/transactions/balances");
        setBalances(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch balances");
      }
    };
    fetchBalances();
  }, []);

  // Step 1 — validation before BTC input
  const handleProceed = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");

    const available =
      walletType === "main" ? balances.mainWallet : balances.profitWallet;

    if (amt > available) return toast.error("Insufficient balance");

    try {
      const [txnsRes, referralRes] = await Promise.all([
        API.get("/transactions/my"),
        API.get("/users/referral-status"),
      ]);

      const txns = txnsRes.data;
      const referralStatus = referralRes.data;

      const hasInvestment = txns.some(
        (t: Transaction) => t.type === "investment"
      );
      if (!hasInvestment)
        return toast.error("You need to invest before withdraw");

      const investmentsRes = await API.get("/transactions/investments");
      const investments = investmentsRes.data;

      const hasActiveInvestment = investments.some(
        (inv: any) => inv.status === "active"
      );
      if (hasActiveInvestment) {
        return toast.error("Your investment period needs to elapse");
      }

      if (referralStatus.totalReferrals < 1)
        return toast.error(
          "You must refer at least one person before withdrawal"
        );

      if (!referralStatus.hasDepositingReferral)
        return toast.error(
          "At least one of your referred users must have made a successful deposit before you can withdraw"
        );

      setStep("btc");
    } catch (err) {
      console.error(err);
      toast.error("Error validating withdraw conditions");
    }
  };

  // Step 2 — validate BTC address
  const handleBtcProceed = async () => {
    if (!btcAddress.trim())
      return toast.error("Paste your Bitcoin wallet address");
    
    try {
      await API.post("/withdraw-wallet", { btcAddress });
      toast.success("Wallet address saved successfully ✅");
      setStep("confirm");
    } catch {
      toast.error("Failed to save wallet address ❌");
    }
  };

  // Step 3 — confirm and create pending transaction
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await API.post("/transactions", {
        type: "withdrawal",
        amount: Number(amount),
        status: "pending",
        walletType,
      });
      const txn = res.data.transaction;
      setReference(txn.reference);
      toast.success("Withdrawal request submitted successfully");
      setStep("pending");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to submit withdrawal");
    } finally {
      setLoading(false);
    }
  };

  // Step 4 — reset to withdraw again
  const handleWithdrawAgain = () => {
    setAmount("");
    setBtcAddress("");
    setStep("form");
  };

  const handleCopyAddress = () => {
    if (btcAddress) {
      navigator.clipboard.writeText(btcAddress);
      setCopied(true);
      toast.success("Address copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAmount = (value: string) => {
    const num = Number(value);
    if (isNaN(num)) return "";
    return num.toLocaleString();
  };

  const availableBalance = walletType === "main" ? balances.mainWallet : balances.profitWallet;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate("/user/dashboard")}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Cash Out</h1>
          </div>
          <p className="text-gray-500 text-sm ml-11">Withdraw funds from your account</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5 mb-6 shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-green-100 text-sm font-medium">Available Balance</p>
              <p className="text-2xl font-bold text-white mt-1">
                ${availableBalance.toLocaleString()}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-white/80" />
          </div>
          <p className="text-green-100 text-xs">
            {walletType === "main" ? "Main Wallet" : "Profit Wallet"}
          </p>
        </div>

        {/* Form Step */}
        {step === "form" && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-6 space-y-5">
              {/* Wallet Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Wallet
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setWalletType("main")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      walletType === "main"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Wallet className={`w-6 h-6 mx-auto mb-2 ${
                      walletType === "main" ? "text-green-600" : "text-gray-400"
                    }`} />
                    <p className={`font-medium ${
                      walletType === "main" ? "text-green-600" : "text-gray-700"
                    }`}>Main Wallet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      ${balances.mainWallet.toLocaleString()}
                    </p>
                  </button>
                  <button
                    onClick={() => setWalletType("profit")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      walletType === "profit"
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${
                      walletType === "profit" ? "text-green-600" : "text-gray-400"
                    }`} />
                    <p className={`font-medium ${
                      walletType === "profit" ? "text-green-600" : "text-gray-700"
                    }`}>Profit Wallet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      ${balances.profitWallet.toLocaleString()}
                    </p>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    $
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-4 text-xl font-semibold rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors text-gray-900"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Minimum withdrawal: $10
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Withdrawals are processed within 24-48 hours after verification.
                </p>
              </div>

              <button
                onClick={handleProceed}
                disabled={!amount || Number(amount) <= 0 || Number(amount) > availableBalance}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* BTC Address Step */}
        {step === "btc" && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-fadeIn">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bitcoin className="w-5 h-5 text-orange-500" />
                <h2 className="font-bold text-gray-900">Bitcoin Wallet Address</h2>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Warning */}
              <div className="bg-yellow-50 rounded-xl p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700">
                  ⚠️ Please ensure you enter a valid Bitcoin wallet address. Incorrect addresses may result in permanent loss of funds.
                </p>
              </div>

              {/* BTC Address Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bitcoin Wallet Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={btcAddress}
                    onChange={(e) => setBtcAddress(e.target.value)}
                    placeholder="Enter your BTC address"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors font-mono text-sm"
                  />
                  {btcAddress && (
                    <button
                      onClick={handleCopyAddress}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      {copied ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBtcProceed}
                  disabled={!btcAddress.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
                <button
                  onClick={() => setStep("form")}
                  className="px-6 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Step */}
        {step === "confirm" && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-fadeIn">
            <div className="p-6 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-center">Confirm Withdrawal</h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount</span>
                  <span className="font-bold text-gray-900 text-lg">
                    ${formatAmount(amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Wallet</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {walletType} wallet
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-medium text-gray-900 flex items-center gap-1">
                    <Bitcoin className="w-4 h-4 text-orange-500" /> Bitcoin
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee</span>
                  <span className="font-medium text-green-600">$0.00</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">You'll receive</span>
                    <span className="font-bold text-green-600 text-lg">
                      ${formatAmount(amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* BTC Address Display */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Sending to</p>
                <p className="text-sm font-mono text-gray-700 break-all">{btcAddress}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Withdrawal"
                  )}
                </button>
                <button
                  onClick={() => setStep("btc")}
                  disabled={loading}
                  className="px-6 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pending Step */}
        {step === "pending" && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-fadeIn">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Withdrawal Pending
              </h2>
              <p className="text-3xl font-bold text-green-600 mb-4">
                ${formatAmount(amount)}
              </p>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                <p className="text-sm font-mono text-gray-900 break-all">{reference}</p>
              </div>

              <p className="text-gray-500 text-sm mb-6">
                Your withdrawal request has been submitted and is pending review. 
                Funds will be sent to your Bitcoin wallet within 24-48 hours.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleWithdrawAgain}
                  className="flex-1 px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Make Another Withdrawal
                </button>
                <button
                  onClick={() => navigate("/user/transactions")}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  View Transactions <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}