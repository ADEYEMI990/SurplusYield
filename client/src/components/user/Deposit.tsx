// client/src/components/user/Deposit.tsx
import { useState } from "react";
import { toast } from "react-toastify";
import { Copy, CheckCircle2, Upload, CheckCircle, Bitcoin } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import Button from "../common/Button";
import useAuthStore from "../../stores/authStore";
import API from "../../lib/api";
import axios from "axios";

export default function Deposit() {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState<number | "">("");
  const [showBitcoinSection, setShowBitcoinSection] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [showPendingSummary, setShowPendingSummary] = useState(false);
  const [copied, setCopied] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [referenceId, setReferenceId] = useState<string>("");

  const walletAddress = "1KgHhwLqj7ouYMFkxACxSh7r4v22sQsfwu";

  const handleProceed = () => {
    if (!amount || amount < 100) {
      toast.error("Enter amount to proceed deposit");
      return;
    }
    setShowBitcoinSection(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success("Copied successfully");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceedAfterDeposit = () => setShowReceiptUpload(true);

  const handleCompleteDeposit = async () => {
    if (!receipt) {
      toast.error("Upload a deposit receipt to complete Deposit");
      return;
    }

    if (!user?._id) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const ref = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const formData = new FormData();
      formData.append("user", user._id);
      formData.append("amount", String(amount));
      formData.append("type", "deposit");
      formData.append("status", "pending");
      formData.append("reference", ref);
      formData.append("currency", "USD");
      formData.append("receipt", receipt);

      const response = await API.post("/transactions", formData);

      if (response.data?.transaction) {
        setReferenceId(ref);
        setShowBitcoinSection(false);
        setShowReceiptUpload(false);
        setShowPendingSummary(true);
        toast.success("Deposit created successfully (Pending)");
      } else toast.error("Failed to create deposit transaction");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message || "Error creating deposit transaction"
        );
      } else toast.error("An unexpected error occurred");
    }
  };

  const resetDeposit = () => {
    setAmount("");
    setReceipt(null);
    setShowBitcoinSection(false);
    setShowReceiptUpload(false);
    setShowPendingSummary(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6 md:p-8 lg:p-10 text-center">
      {!showPendingSummary && (
        <>
          {/* ===== Title & Description ===== */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            Deposit Funds
          </h1>
          <p className="text-gray-500 text-sm sm:text-base mb-6 leading-relaxed">
            Minimum Deposit: <b>$100 USD</b> <br />
            Maximum Deposit: <b>Unlimited</b>
          </p>

          {/* ===== Input ===== */}
          <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md mb-4 focus-within:ring-2 focus-within:ring-blue-500">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount"
              className="flex-1 bg-transparent outline-none text-gray-800 text-sm sm:text-base"
              min={100}
            />
            <span className="text-gray-700 font-semibold text-sm">USD</span>
          </div>

          <p className="text-gray-500 text-xs sm:text-sm mb-4">
            Enter amount and click on Proceed below
          </p>

          <Button
            variant={!amount ? "danger" : "primary"}
            size="lg"
            className="w-full mb-6 transition-all duration-300"
            onClick={handleProceed}
          >
            Proceed
          </Button>

          {/* ===== Bitcoin Deposit Section ===== */}
          {showBitcoinSection && (
            <div className="bg-gray-800/80 backdrop-blur-md text-white rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                <Bitcoin className="text-yellow-400" /> Deposit Bitcoin
              </div>

              <div className="border border-gray-600 rounded-lg p-3 flex justify-between text-sm sm:text-base">
                <span>Network</span>
                <span>Bitcoin</span>
              </div>

              <div className="flex justify-center bg-white rounded-xl p-4">
                <QRCodeCanvas
                  value={walletAddress}
                  size={180}
                  fgColor="#000000"
                  bgColor="#ffffff"
                  level="H"
                />
              </div>

              <p className="text-gray-300 text-sm">
                Use the wallet address below 👇
              </p>

              <div className="text-left">
                <p className="text-sm mb-1 text-gray-300 font-medium">
                  Wallet Address
                </p>
                <div
                  onClick={handleCopy}
                  className="border border-gray-600 hover:border-gray-400 rounded-lg p-3 flex justify-between items-center cursor-pointer transition-colors"
                >
                  <span className="truncate text-xs sm:text-sm">
                    {walletAddress}
                  </span>
                  {copied ? (
                    <CheckCircle2 className="text-green-500" size={20} />
                  ) : (
                    <Copy size={20} />
                  )}
                </div>
              </div>

              <p className="text-yellow-400 text-xs sm:text-sm leading-relaxed">
                ⚠️ Only send BTC to this address. Any other currency sent will
                be lost and cannot be refunded.
              </p>

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-3"
                onClick={handleProceedAfterDeposit}
              >
                Proceed
              </Button>
            </div>
          )}

          {/* ===== Receipt Upload Section ===== */}
          {showReceiptUpload && (
            <div className="bg-gray-800/80 backdrop-blur-md text-white rounded-2xl p-6 mt-6 space-y-4 shadow-xl">
              <div className="text-center text-lg font-semibold">
                Upload Deposit Receipt
              </div>

              <div className="border border-gray-600 rounded-lg p-4 flex flex-col items-center">
                <Upload size={28} className="text-gray-300 mb-2" />
                <input
                  placeholder="Upload Receipt"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                  className="text-sm text-gray-300"
                />
              </div>

              <p className="text-gray-400 text-xs sm:text-sm">
                Upload your payment proof to complete your deposit
              </p>

              <Button
                variant={!receipt ? "danger" : "primary"}
                size="lg"
                className="w-full mt-3"
                onClick={handleCompleteDeposit}
              >
                Complete Deposit
              </Button>
            </div>
          )}
        </>
      )}

      {/* ===== Pending Summary ===== */}
      {showPendingSummary && (
        <div className="bg-gray-800/80 backdrop-blur-md text-white rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
          <div className="flex justify-center">
            <CheckCircle className="text-green-500" size={60} />
          </div>
          <h2 className="text-2xl font-bold">${amount} Deposit Pending</h2>
          <p className="text-gray-300 text-sm">
            Your deposit is pending confirmation.
          </p>
          <p className="text-gray-400 text-sm">
            Transaction ID: <b>{referenceId}</b>
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
            <Button variant="secondary" className="flex-1" onClick={resetDeposit}>
              Deposit Again
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => (window.location.href = "/user/transactions")}
            >
              View Transaction
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

