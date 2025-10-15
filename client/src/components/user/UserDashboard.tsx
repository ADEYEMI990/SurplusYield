// src/components/user/UserDashboard.tsx
import { useEffect, useRef, useState } from "react";
import { Bell, Settings, KeyRound, LogOut, Copy, User } from "lucide-react";
import {
  Wallet,
  Folder,
  PiggyBank,
  ArrowDownCircle,
  ArrowUpCircle,
  Coins,
  Receipt,
  DollarSign,
  TrendingUp,
  Gift,
  Users,
  Calculator,
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import { CardContent, CardHeader, CardTitle } from "../common/Card";
import Card from "../common/Card";
import Button from "../common/Button";
import Input from "../common/Input";
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

export default function UserDashboard() {
  // Define the expected user type

  const { user, logout } = useAuthStore();
  console.log("DASHBOARD USER:", user);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // Close notifications if open and click is outside it
      if (
        showNotifications &&
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }

      // Close profile menu if open and click is outside it
      if (
        showProfileMenu &&
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications, showProfileMenu]);

  const referralCode = user?.referralCode || "";

  const copyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  // Calculator state
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(10); // %
  const [duration, setDuration] = useState(12); // months

  const projected = ((amount * rate * duration) / 100).toFixed(2);

  // transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/transactions/my");

        console.log("Fetched transactions:", data);

        // ✅ only keep the 5 most recent
        setTransactions(data.slice(0, 5));
      } catch (err) {
        console.error("Error fetching transactions:", err);
        toast.error("Failed to load transactions ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // ✅ Map bonus and normal types
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

  // ✅ Choose icon based on type/bonus
  const getIcon = (t: Transaction) => {
    if (t.type === "bonus") return <Gift className="w-5 h-5 text-purple-500" />;
    if (t.type === "deposit")
      return <ArrowUpCircle className="w-5 h-5 text-green-500" />;
    if (t.type === "withdrawal")
      return <ArrowDownCircle className="w-5 h-5 text-red-500" />;
    if (t.type === "investment")
      return <PiggyBank className="w-5 h-5 text-blue-500" />;
    return <Wallet className="w-5 h-5 text-gray-500" />;
  };

  // ✅ Status badge colors
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

    if (isPositive) {
      return (
        <span className="text-green-600 flex items-center space-x-1">
          <ArrowUpCircle className="w-4 h-4" />
          <span>+{t.amount} USD</span>
        </span>
      );
    }

    if (isNegative) {
      return (
        <span className="text-red-600 flex items-center space-x-1">
          <ArrowDownCircle className="w-4 h-4" />
          <span>-{t.amount} USD</span>
        </span>
      );
    }

    return <span>{t.amount} USD</span>;
  };

  const navigate = useNavigate();
  function SummaryCard({
    title,
    value,
    icon,
    onClick,
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    onClick?: () => void;
  }) {
    return (
      <Card
        onClick={onClick}
        className={`cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-100`}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{title}</p>
          </div>
          <div className="text-blue-600">{icon}</div>
        </div>
      </Card>
    );
  }

  const [balances, setBalances] = useState({
    accountBalance: 0,
    mainWallet: 0,
    profitWallet: 0,
  });

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const { data } = await API.get("/transactions/balances");
        setBalances(data);
      } catch (err) {
        console.error("Error fetching balances:", err);
        toast.error("Failed to load balances ❌");
      }
    };
    fetchBalances();
  }, []);

  // Base interface with known fields
  interface DashboardStats {
    allTransactions: number;
    totalDeposit: number;
    totalInvestment: number;
    totalProfit: number;
    totalWithdraw: number;
    referralBonus: number;
    depositBonus: number;
    investmentBonus: number;
    signupBonus: number;
    totalReferrals: number;

    // 👇 index signature: allows extra fields automatically
    [key: string]: number | string | undefined;
  }

  // State
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/transactions/stats");
        setStats(data);
      } catch {
        toast.error("Failed to load dashboard stats ❌");
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
        {/* Left: Logo + name */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => (window.location.href = "/user/dashboard")}
        >
          <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-bold rounded">
            SY
          </div>
          <span className="font-bold text-lg">Surplus Yield</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 relative">
          {/* Notifications */}
          <div ref={notificationsRef} className="relative">
            <Bell
              className="cursor-pointer"
              onClick={() => {
                setShowNotifications((s) => !s);
                setShowProfileMenu(false); // ✅ close profile when opening notifications
              }}
            />
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 bg-white shadow rounded p-3">
                <p className="text-sm text-gray-600">No new notifications</p>
              </div>
            )}
          </div>

          {/* User name */}
          <h2 className="text-xl font-bold">
            Welcome, {user?.name ? user.name.trim().split(/\s+/)[0] : "User"}
          </h2>

          {/* Profile dropdown */}
          <div ref={profileRef} className="relative">
            <User
              size={32}
              className="text-gray-300 cursor-pointer rounded-full p-1 hover:bg-gray-800"
              onClick={() => {
                setShowProfileMenu((s) => !s);
                setShowNotifications(false); // ✅ close notifications when opening profile
              }}
            />

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 text-white rounded shadow-lg">
                <ul className="divide-y divide-gray-700">
                  <li
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                    onClick={() => navigate("/user/kyc")}
                  >
                    <Settings size={16} /> Kyc
                  </li>

                  <li
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                    onClick={() => navigate("/user/change-password")}
                  >
                    <KeyRound size={16} /> Change Password
                  </li>

                  <li
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 cursor-pointer flex items-center gap-2"
                    onClick={logout}
                  >
                    <LogOut size={16} /> Logout
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>

      <hr />

      {/* Referral URL section */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-72">
            <Input
              value={referralCode}
              readOnly
              className="pr-12 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={copyReferral}
              className="
          absolute right-1 top-1/2 -translate-y-1/2
          transition-all duration-200
          hover:bg-gray-700 hover:text-white
          hover:scale-150
          active:scale-95
          shadow-sm hover:shadow-md
          rounded-full
        "
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <hr />

      {/* Hero Section */}
      <div className="space-y-6 mt-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ---- LEFT SECTION (inside container) ---- */}
          <div className="bg-white shadow rounded-lg p-4 space-y-4 ml-4">
            {/* Account Balance */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Account Balance</h2>
                <Wallet size={28} />
              </div>
              <p className="mt-2 text-3xl font-bold">
                ${balances.accountBalance.toLocaleString()}
              </p>
            </Card>

            {/* Wallets */}
            <div className="space-y-3">
              <Card className="flex justify-between items-center">
                <div>
                  <p className="text-xl font-bold">
                    ${balances.mainWallet.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Folder size={16} /> Main Wallet
                  </div>
                </div>
              </Card>

              <Card className="flex justify-between items-center">
                <div>
                  <p className="text-xl font-bold">
                    ${balances.profitWallet.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <PiggyBank size={16} /> Profit Wallet
                  </div>
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="md"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => navigate("/user/deposit")}
              >
                <ArrowDownCircle size={18} /> Deposit
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => navigate("/user/plans")}
              >
                <TrendingUp size={18} /> Invest Now
              </Button>
              <Button
                variant="danger"
                size="md"
                className="flex-1 flex items-center justify-center gap-2"
                onClick={() => navigate("/user/withdraw")}
              >
                <ArrowUpCircle size={18} /> Withdraw
              </Button>
            </div>
          </div>

          {/* ---- RIGHT SECTION (3 in a row) ---- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mr-4">
            <SummaryCard
              title="All Transactions"
              value={(stats?.allTransactions || 0).toString()}
              icon={<Receipt size={22} />}
              onClick={() => navigate("/user/transactions")}
            />
            <SummaryCard
              title="Total Deposit"
              value={`$${stats?.totalDeposit || 0}`}
              icon={<DollarSign size={22} />}
              onClick={() => navigate("/user/deposit")}
            />
            <SummaryCard
              title="Total Investment"
              value={`$${stats?.totalInvestment || 0}`}
              icon={<TrendingUp size={22} />}
              onClick={() => navigate("/user/plans")}
            />
            <SummaryCard
              title="Total Profit"
              value={`$${stats?.totalProfit || 0}`}
              icon={<Coins size={22} />}
            />
            <SummaryCard
              title="Total Withdraw"
              value={`$${stats?.totalWithdraw || 0}`}
              icon={<ArrowUpCircle size={22} />}
            />
            <SummaryCard
              title="Referral Bonus"
              value={`$${stats?.referralBonus || 0}`}
              icon={<Gift size={22} />}
            />
            <SummaryCard
              title="Deposit Bonus"
              value={`$${stats?.depositBonus || 0}`}
              icon={<DollarSign size={22} />}
            />
            <SummaryCard
              title="Investment Bonus"
              value={`$${stats?.investmentBonus || 0}`}
              icon={<TrendingUp size={22} />}
            />
            <SummaryCard
              title="Total Referrals"
              value={(stats?.totalReferrals || 0).toString()}
              icon={<Users size={22} />}
            />
          </div>
        </div>
      </div>

      {/* CALCULATOR */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" /> Investment Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm">Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm">Rate (%)</label>
            <Input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm">Duration (months)</label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-sm font-medium">Projected Return</span>
            <span className="text-lg font-bold">${projected}</span>
          </div>
        </CardContent>
      </Card>
      <hr />
      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : transactions.length === 0 ? (
            <p>No recent transactions</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b text-left">
                  <tr>
                    <th className="py-2 px-4">Description</th>
                    <th className="py-2 px-4">Transaction ID</th>
                    <th className="py-2 px-4">Type</th>
                    <th className="py-2 px-4">Amount</th>
                    <th className="py-2 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t._id} className="border-b">
                      {/* ✅ Description */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div>{getIcon(t)}</div>
                          <div>
                            <p className="font-medium">{formatType(t)}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(t.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ✅ Transaction ID */}
                      <td className="py-3 px-4">{t.reference}</td>

                      {/* ✅ Type */}
                      <td className="py-3 px-4">{formatType(t)}</td>

                      {/* ✅ Amount */}
                      <td className="py-3 px-4 font-semibold">
                        {renderAmount(t)}
                      </td>

                      {/* ✅ Status */}
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
        </CardContent>
      </Card>
    </div>
  );
}
