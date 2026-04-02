// src/components/user/Transactions.tsx

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  Gift,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Receipt,
  Coins,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../lib/api";

interface Transaction {
  _id: string;
  type: "deposit" | "withdrawal" | "investment" | "profit" | "roi" | "bonus";
  bonusType?: "referral" | "deposit" | "investment" | "signup";
  amount: number;
  createdAt: string;
  status: "success" | "pending" | "failed";
  reference: string;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/transactions/my");
        // Ensure amounts are numbers
        const processedData = data.map((t: any) => ({
          ...t,
          amount: typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount
        }));
        setTransactions(processedData);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        toast.error("Failed to load transactions ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter logic
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === "All" || t.type === filterType.toLowerCase();
    const matchesStatus = filterStatus === "All" || t.status === filterStatus.toLowerCase();
    return matchesType && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const nextPage = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  const refreshData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/transactions/my");
      const processedData = data.map((t: any) => ({
        ...t,
        amount: typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount
      }));
      setTransactions(processedData);
      toast.success("Transactions refreshed");
    } catch {
      toast.error("Failed to refresh transactions");
    } finally {
      setLoading(false);
    }
  };

  // Helper formatters
  const formatType = (t: Transaction) => {
    if (t.type === "bonus") {
      if (t.bonusType === "signup") return "SignUp Bonus";
      if (t.bonusType === "deposit") return "Deposit Bonus";
      if (t.bonusType === "investment") return "Investment Bonus";
      if (t.bonusType === "referral") return "Referral Bonus";
      return "Bonus";
    }
    if (t.type === "roi") return "ROI Payment";
    if (t.type === "profit") return "Profit";
    return t.type.charAt(0).toUpperCase() + t.type.slice(1);
  };

  const getIcon = (t: Transaction) => {
    if (t.type === "bonus") return <Gift className="w-5 h-5 text-green-500" />;
    if (t.type === "deposit") return <ArrowUpCircle className="w-5 h-5 text-green-500" />;
    if (t.type === "withdrawal") return <ArrowDownCircle className="w-5 h-5 text-red-500" />;
    if (t.type === "investment") return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (t.type === "roi") return <DollarSign className="w-5 h-5 text-green-500" />;
    if (t.type === "profit") return <Coins className="w-5 h-5 text-green-500" />;
    return <Wallet className="w-5 h-5 text-gray-400" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Calculate stats - only count successful transactions and ensure proper number addition
  const successfulTransactions = transactions.filter(t => t.status === "success");
  
  const stats = {
    totalTransactions: successfulTransactions.length,
    totalDeposits: successfulTransactions
      .filter(t => t.type === "deposit")
      .reduce((sum, t) => {
        const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount as any);
        return sum + amount;
      }, 0),
    totalWithdrawals: successfulTransactions
      .filter(t => t.type === "withdrawal")
      .reduce((sum, t) => {
        const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount as any);
        return sum + amount;
      }, 0),
    totalInvestments: successfulTransactions
      .filter(t => t.type === "investment")
      .reduce((sum, t) => {
        const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount as any);
        return sum + amount;
      }, 0),
    totalProfit: successfulTransactions
      .filter(t => t.type === "profit" || t.type === "roi" || t.type === "bonus")
      .reduce((sum, t) => {
        const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount as any);
        return sum + amount;
      }, 0),
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          </div>
          <p className="text-gray-500 text-sm ml-11">View and manage all your financial activity</p>
        </div>

        {/* Stats Cards - Matching Dashboard Style */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Total</span>
              <Receipt className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-xl font-bold text-gray-900">{stats.totalTransactions}</p>
            <p className="text-xs text-gray-500 mt-1">Transactions</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Deposits</span>
              <DollarSign className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-xl font-bold text-gray-900">${stats.totalDeposits.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Total deposited</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Invested</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-xl font-bold text-gray-900">${stats.totalInvestments.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Active investments</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Profit</span>
              <Coins className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-xl font-bold text-gray-900">${stats.totalProfit.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Total earned</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">Filters</span>
              {(filterType !== "All" || filterStatus !== "All") && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  Active
                </span>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-green-600 hover:text-green-700"
            >
              {showFilters ? "Hide" : "Show"} Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 mt-2 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                >
                  {["All", "Deposit", "Withdrawal", "Investment", "ROI", "Bonus"].map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                >
                  {["All", "Success", "Pending", "Failed"].map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {(filterType !== "All" || filterStatus !== "All") && (
              <button
                onClick={() => {
                  setFilterType("All");
                  setFilterStatus("All");
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Transaction History</h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
            </p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-500">Loading transactions...</p>
            </div>
          ) : paginatedTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions found</p>
              {(filterType !== "All" || filterStatus !== "All") && (
                <button
                  onClick={() => {
                    setFilterType("All");
                    setFilterStatus("All");
                  }}
                  className="mt-3 text-sm text-green-600 hover:text-green-700"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {paginatedTransactions.map((t) => {
                const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount as any);
                const isPositive = t.type === "deposit" || t.type === "bonus" || t.type === "roi" || t.type === "profit";
                const isNegative = t.type === "withdrawal";
                
                return (
                  <div key={t._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                          {getIcon(t)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-gray-900">{formatType(t)}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(t.status)}`}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(t.status)}
                                {t.status}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-500">
                              {new Date(t.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-xs text-gray-400 font-mono mt-1">
                            Ref: {t.reference}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        {isPositive ? (
                          <span className="text-green-600 font-semibold text-lg">
                            +${amount.toLocaleString()}
                          </span>
                        ) : isNegative ? (
                          <span className="text-red-600 font-semibold text-lg">
                            -${amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="font-semibold text-lg">${amount.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <button
                disabled={currentPage === 1}
                onClick={prevPage}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={nextPage}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}