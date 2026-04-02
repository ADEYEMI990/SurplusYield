// src/components/user/Deposit.tsx

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Copy,
  CheckCircle2,
  Upload,
  CheckCircle,
  Bitcoin,
  ArrowLeft,
  DollarSign,
  Clock,
  AlertCircle,
  X,
  FileText,
  ExternalLink,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import useAuthStore from "../../stores/authStore";
import API from "../../lib/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Deposit() {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState<number | "">("");
  const [showBitcoinSection, setShowBitcoinSection] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [showPendingSummary, setShowPendingSummary] = useState(false);
  const [copied, setCopied] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [referenceId, setReferenceId] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const navigate = useNavigate();

  const [walletAddress, setWalletAddress] = useState<string>("");

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data } = await API.get("/wallet");
        setWalletAddress(data.address);
      } catch {
        toast.error("Failed to fetch wallet address");
      }
    };
    fetchWallet();
  }, []);

  const handleProceed = () => {
    if (!amount || amount < 100) {
      toast.error("Minimum deposit amount is $100");
      return;
    }
    setShowBitcoinSection(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success("Wallet address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceedAfterDeposit = () => setShowReceiptUpload(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setReceipt(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setReceipt(null);
    setPreviewUrl("");
  };

  const handleCompleteDeposit = async () => {
    if (!receipt) {
      toast.error("Please upload your deposit receipt");
      return;
    }

    if (!user?._id) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const ref = `${Date.now()}`;

      const formData = new FormData();
      formData.append("user", user._id);
      formData.append("amount", String(amount));
      formData.append("type", "deposit");
      formData.append("status", "pending");
      formData.append("reference", ref);
      formData.append("currency", "USD");
      formData.append("receipt", receipt);

      const response = await API.post("/transactions", formData);

      if (response.data?.id) {
        setReferenceId(ref);
        setShowBitcoinSection(false);
        setShowReceiptUpload(false);
        setShowPendingSummary(true);
        toast.success("Deposit submitted successfully! Pending confirmation.");
      } else {
        toast.error("Failed to create deposit transaction");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message || "Error creating deposit transaction"
        );
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  const resetDeposit = () => {
    setAmount("");
    setReceipt(null);
    setPreviewUrl("");
    setShowBitcoinSection(false);
    setShowReceiptUpload(false);
    setShowPendingSummary(false);
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Add Money</h1>
          </div>
          <p className="text-gray-500 text-sm ml-11">Deposit funds to your account</p>
        </div>

        {!showPendingSummary && (
          <>
            {/* Info Card */}
            <div className="bg-gradient-to-r from-green-50 to-white rounded-2xl p-5 mb-6 border border-green-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Deposit Limits</h3>
                  <p className="text-sm text-gray-600">
                    Minimum: <span className="font-medium">$100 USD</span><br />
                    Maximum: <span className="font-medium">Unlimited</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Amount Input Card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-6">
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Amount
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    $
                  </div>
                  <input
                    type="number"
                    value={amount === "" ? "" : amount}
                    onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-4 text-2xl font-semibold rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors text-gray-900"
                    min={100}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter the amount you want to deposit
                </p>
              </div>
              
              <div className="p-6 pt-0">
                <button
                  onClick={handleProceed}
                  disabled={!amount || amount < 100}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Bitcoin Deposit Section */}
            {showBitcoinSection && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-6 animate-fadeIn">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Bitcoin className="w-5 h-5 text-orange-500" />
                    <h2 className="font-bold text-gray-900">Bitcoin Deposit</h2>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Network Info */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Network</span>
                    <span className="text-sm font-medium text-gray-900">Bitcoin (BTC)</span>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                      <QRCodeCanvas
                        value={walletAddress}
                        size={200}
                        fgColor="#000000"
                        bgColor="#ffffff"
                        level="H"
                      />
                    </div>
                  </div>

                  {/* Wallet Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wallet Address
                    </label>
                    <div
                      onClick={handleCopy}
                      className="border border-gray-200 rounded-xl p-3 flex justify-between items-center cursor-pointer hover:border-green-500 transition-colors group"
                    >
                      <span className="text-sm font-mono text-gray-700 truncate flex-1">
                        {walletAddress || "Loading..."}
                      </span>
                      {copied ? (
                        <CheckCircle2 className="text-green-500 flex-shrink-0 ml-2" size={20} />
                      ) : (
                        <Copy className="text-gray-400 group-hover:text-green-500 transition-colors flex-shrink-0 ml-2" size={20} />
                      )}
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="bg-yellow-50 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-700">
                      ⚠️ Only send BTC to this address. Any other currency sent will be lost and cannot be refunded.
                    </p>
                  </div>

                  <button
                    onClick={handleProceedAfterDeposit}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors"
                  >
                    I've Made the Payment
                  </button>
                </div>
              </div>
            )}

            {/* Receipt Upload Section */}
            {showReceiptUpload && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-fadeIn">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-green-600" />
                    <h2 className="font-bold text-gray-900">Upload Proof of Payment</h2>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {!receipt ? (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 transition-colors bg-gray-50 hover:bg-green-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload receipt</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF (max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="space-y-3">
                      {previewUrl && !previewUrl.includes('.pdf') && (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Receipt preview"
                            className="w-full max-h-64 object-contain rounded-xl border border-gray-200"
                          />
                          <button
                            onClick={removeFile}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {receipt && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">{receipt.name}</p>
                            <p className="text-xs text-gray-500">
                              {(receipt.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            onClick={removeFile}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      Your deposit will be reviewed within 24 hours. You'll receive a confirmation email once approved.
                    </p>
                  </div>

                  <button
                    onClick={handleCompleteDeposit}
                    disabled={!receipt}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Complete Deposit
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Pending Summary */}
        {showPendingSummary && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-fadeIn">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Deposit Pending
              </h2>
              <p className="text-3xl font-bold text-green-600 mb-4">
                ${typeof amount === 'number' ? amount.toLocaleString() : amount}
              </p>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                <p className="text-sm font-mono text-gray-900">{referenceId}</p>
              </div>

              <p className="text-gray-500 text-sm mb-6">
                Your deposit is being processed. You'll receive a confirmation once completed.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={resetDeposit}
                  className="flex-1 px-4 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  Make Another Deposit
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