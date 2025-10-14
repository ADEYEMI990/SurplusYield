// client/src/components/user/Withdraw.tsx
import { useEffect, useState } from "react";
import Card, { CardHeader, CardTitle, CardContent } from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
import Select from "../common/Select";
import { toast } from "react-toastify";
import API from "../../lib/api"; // ✅ use centralized Axios instance
import type { Transaction } from "../../types/transaction";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
  const navigate = useNavigate();

  // ✅ Fetch balances on load (uses token automatically)
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

  // ✅ Step 1 — validation before BTC input
  const handleProceed = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return toast.error("Enter a valid amount");

    const available =
      walletType === "main" ? balances.mainWallet : balances.profitWallet;

    if (amt > available) return toast.error("Insufficient balance");

    try {
      // ✅ Fetch transactions, dashboard stats, and referral deposit info
      const [txnsRes,referralRes] = await Promise.all([
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

      // ✅ Check active investment
      const activeInvestment = txns.find(
        (t: Transaction) =>
          t.type === "investment" && t.status === "success" && !t.isCompleted
      );
      if (activeInvestment)
        return toast.error("Your investment period needs to elapse");

      // ✅ Check referral condition
      if (referralStatus.totalReferrals < 1)
        return toast.error(
          "You must refer at least one person before withdrawal"
        );

      // ✅ Check if referred person has deposited
      if (!referralStatus.hasDepositingReferral)
        return toast.error(
          "At least one of your referred users must have made a successful deposit before you can withdraw"
        );

      // ✅ Passed all conditions
      setStep("btc");
    } catch (err) {
      console.error(err);
      toast.error("Error validating withdraw conditions");
    }
  };

  // ✅ Step 2 — validate BTC address
  const handleBtcProceed = () => {
    if (!btcAddress.trim())
      return toast.error("Paste your Bitcoin wallet address");
    setStep("confirm");
  };

  // ✅ Step 3 — confirm and create pending transaction
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
      toast.success("Pending withdraw successfully submitted");
      setStep("pending");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to submit withdraw");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 4 — reset to withdraw again
  const handleWithdrawAgain = () => {
    setAmount("");
    setBtcAddress("");
    setStep("form");
  };

  return (
    <div className="w-full flex justify-center mt-6 px-3">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle className="mb-2">
            <div className="flex items-center gap-3">
              <button
                title="Go Back"
                onClick={() => navigate("/user/dashboard")}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-center w-full">
                Withdraw Money
              </h1>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === "form" && (
            <>
              <p className="text-gray-600 text-sm mb-2">
                Choose wallet to withdraw from
              </p>
              <Select
                value={walletType}
                onChange={(e) => setWalletType(e.target.value)}
                options={[
                  {
                    value: "main",
                    label: `Main Wallet ($${balances.mainWallet.toFixed(2)})`,
                  },
                  {
                    value: "profit",
                    label: `Profit Wallet ($${balances.profitWallet.toFixed(2)})`,
                  },
                ]}
              />

              <Input
                label="Enter Withdraw Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <Button onClick={handleProceed} className="w-full mt-3">
                Proceed
              </Button>
            </>
          )}

          {step === "btc" && (
            <>
              <p className="text-gray-700 font-medium">
                Deposit the amount into your Bitcoin Wallet
              </p>
              <p className="text-sm text-red-500">
                Please make sure that only BTC wallet address is input below.
                Otherwise, your withdraw amount will not be deposited nor
                refunded.
              </p>

              <Input
                label="Copy and paste your Bitcoin wallet address"
                placeholder="Paste BTC address"
                value={btcAddress}
                onChange={(e) => setBtcAddress(e.target.value)}
              />

              <Button onClick={handleBtcProceed} className="w-full mt-3">
                Proceed
              </Button>
            </>
          )}

          {step === "confirm" && (
            <div className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <h3 className="font-semibold text-center text-lg mb-2">
                Withdraw Details
              </h3>

              <div className="flex justify-between">
                <span>Withdraw Amount:</span>
                <span className="font-medium">${amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Withdraw Method:</span>
                <span className="font-medium">Bitcoin</span>
              </div>
              <div className="flex justify-between">
                <span>Withdraw Fee:</span>
                <span className="font-medium">$0</span>
              </div>

              <div className="flex gap-3 mt-3">
                <Button
                  onClick={handleConfirm}
                  className="flex-1"
                  loading={loading}
                >
                  Confirm Withdraw
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("form")}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === "pending" && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-bold text-lg">${amount} Withdraw Pending</h3>
              <p>The amount has been pending added into your account</p>
              <p className="text-sm text-gray-600">
                Transaction ID: <span className="font-mono">{reference}</span>
              </p>

              <div className="flex gap-3 mt-3">
                <Button onClick={handleWithdrawAgain} className="flex-1">
                  Withdraw Again
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => (window.location.href = "/user/transactions")}
                >
                  View Transaction
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
