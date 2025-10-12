import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  PiggyBank,
  Gift,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Card  from "../common/Card";
import { CardHeader, CardTitle, CardContent } from "../common/Card";
import Button from "../common/Button";
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
  const [itemsPerPage] = useState(6);
  const navigate = useNavigate();

  // ✅ Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/transactions/my");
        setTransactions(data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        toast.error("Failed to load transactions ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // ✅ Filter logic
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === "All" || t.type === filterType.toLowerCase();
    const matchesStatus = filterStatus === "All" || t.status === filterStatus.toLowerCase();
    return matchesType && matchesStatus;
  });

  // ✅ Pagination logic
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
      setTransactions(data);
      toast.success("Transactions refreshed 🔄");
    } catch {
      toast.error("Failed to refresh transactions ❌");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Helper formatters
  const formatType = (t: Transaction) => {
    if (t.type === "bonus") {
      if (t.bonusType === "signup") return "SignUp Bonus";
      if (t.bonusType === "deposit") return "Deposit Bonus";
      if (t.bonusType === "investment") return "Investment Bonus";
      if (t.bonusType === "referral") return "Referral Bonus";
      return "Bonus";
    }
    return t.type.charAt(0).toUpperCase() + t.type.slice(1);
  };

  const getIcon = (t: Transaction) => {
    if (t.type === "bonus") return <Gift className="w-5 h-5 text-purple-500" />;
    if (t.type === "deposit") return <ArrowUpCircle className="w-5 h-5 text-green-500" />;
    if (t.type === "withdrawal") return <ArrowDownCircle className="w-5 h-5 text-red-500" />;
    if (t.type === "investment") return <PiggyBank className="w-5 h-5 text-blue-500" />;
    return <Wallet className="w-5 h-5 text-gray-500" />;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 border-green-600";
      case "pending":
        return "text-yellow-600 border-yellow-600";
      case "failed":
        return "text-red-600 border-red-600";
      default:
        return "text-gray-600 border-gray-300";
    }
  };

  const renderAmount = (t: Transaction) => {
    const isPositive = t.type === "deposit" || t.type === "bonus";
    const isNegative = t.type === "withdrawal";

    if (isPositive)
      return (
        <span className="text-green-600 flex items-center space-x-1">
          <ArrowUpCircle className="w-4 h-4" />
          <span>+{t.amount} USD</span>
        </span>
      );

    if (isNegative)
      return (
        <span className="text-red-600 flex items-center space-x-1">
          <ArrowDownCircle className="w-4 h-4" />
          <span>-{t.amount} USD</span>
        </span>
      );

    return <span>{t.amount} USD</span>;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* === HEADER === */}
      <div className="flex items-center gap-3">
        <button
          title="Go Back" 
          onClick={() => navigate("/user/dashboard")}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-center w-full">All Transactions</h1>
      </div>

      {/* === FILTERS === */}
      <Card>
        <CardContent className="space-y-4">
          <div>
            <p className="font-medium text-sm mb-1">Filter By Type</p>
            <select
              title="Filter by Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-indigo-300"
            >
              {["All", "Deposit", "Withdraw", "Investment", "ROI", "Bonus"].map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="font-medium text-sm mb-1">Filter By Status</p>
            <select
              title="Filter by Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:ring-indigo-300"
            >
              {["All", "Pending", "Failed", "Success"].map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <Button onClick={refreshData} className="w-full">
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* === TRANSACTIONS TABLE === */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : paginatedTransactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b text-left bg-gray-50 dark:bg-gray-800 text-white">
                  <tr>
                    <th className="py-2 px-4">Description</th>
                    <th className="py-2 px-4">Transaction ID</th>
                    <th className="py-2 px-4 hidden md:table-cell">Type</th>
                    <th className="py-2 px-4">Amount</th>
                    <th className="py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((t) => (
                    <tr key={t._id} className="border-b text-black hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-white">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {getIcon(t)}
                          <div>
                            <p className="font-medium">{formatType(t)}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(t.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{t.reference}</td>
                      <td className="py-3 px-4 hidden md:table-cell">{formatType(t)}</td>
                      <td className="py-3 px-4 font-semibold">{renderAmount(t)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full border text-xs font-medium ${getStatusClass(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* === PAGINATION === */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={prevPage}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Button>

              <span className="text-sm text-black">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={nextPage}
                className="flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}