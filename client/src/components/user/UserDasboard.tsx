// src/components/user/UserDashboard.tsx

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Settings,
  KeyRound,
  LogOut,
  Copy,
  User,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Coins,
  Receipt,
  DollarSign,
  TrendingUp,
  Gift,
  ChevronRight,
  Home,
  History,
  UserCircle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import Button from "../common/Button";
import Input from "../common/Input";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../lib/api";
import InvestmentCalculator from "./InvestmentCalculator";
import { assets } from "../../assets/assets";

interface Transaction {
  _id: string;
  type: "deposit" | "withdrawal" | "investment" | "profit" | "roi" | "bonus";
  bonusType?: "referral" | "deposit" | "investment" | "signup";
  amount: number;
  createdAt: string;
  status: "success" | "pending" | "failed";
  reference: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  read?: boolean;
}

export default function UserDashboard() {
  const { user, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  // === Notifications ===
  const fetchNotifications = async () => {
    try {
      const { data } = await API.get("/notifications");
      setNotifications(data);
      const unread = data.filter((n: Notification) => !n.read).length;
      setUnreadCount(unread);
    } catch {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showNotifications) {
      (async () => {
        try {
          await API.patch("/notifications/mark-all");
          await fetchNotifications();
          setUnreadCount(0);
        } catch (err) {
          console.error("Failed to mark all as read:", err);
        }
      })();
    }
  }, [showNotifications]);

  // === Close dropdowns when clicking outside ===
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        showNotifications &&
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
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

  // === Transactions ===
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/transactions/my");
        setTransactions(data.slice(0, 5));
      } catch {
        toast.error("Failed to load transactions ❌");
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  // === Helpers ===
  const formatType = (t: Transaction) => {
    if (t.type === "bonus") {
      switch (t.bonusType) {
        case "signup":
          return "SignUp Bonus";
        case "deposit":
          return "Deposit Bonus";
        case "investment":
          return "Investment Bonus";
        case "referral":
          return "Referral Bonus";
        default:
          return "Bonus";
      }
    }
    return t.type.charAt(0).toUpperCase() + t.type.slice(1);
  };

  const getIcon = (t: Transaction) => {
    if (t.type === "bonus") return <Gift className="w-5 h-5 text-green-500" />;
    if (t.type === "deposit")
      return <ArrowUpCircle className="w-5 h-5 text-green-500" />;
    if (t.type === "withdrawal")
      return <ArrowDownCircle className="w-5 h-5 text-red-500" />;
    if (t.type === "investment")
      return <TrendingUp className="w-5 h-5 text-green-600" />;
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

  const renderAmount = (t: Transaction) => {
    if (t.type === "deposit" || t.type === "bonus") {
      return (
        <span className="text-green-600 font-semibold">
          +${t.amount.toLocaleString()}
        </span>
      );
    }
    if (t.type === "withdrawal") {
      return (
        <span className="text-red-600 font-semibold">
          -${t.amount.toLocaleString()}
        </span>
      );
    }
    return <span className="font-semibold">${t.amount.toLocaleString()}</span>;
  };

  // === Balances & Stats ===
  const [balances, setBalances] = useState({
    accountBalance: 0,
    mainWallet: 0,
    profitWallet: 0,
  });
  const [stats, setStats] = useState<Record<string, number | string>>({});

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get("/transactions/balances");
        setBalances(data);
      } catch {
        toast.error("Failed to load balances ❌");
      }
    })();

    (async () => {
      try {
        const { data } = await API.get("/transactions/stats");
        setStats(data);
      } catch {
        toast.error("Failed to load dashboard stats ❌");
      }
    })();
  }, []);

  // === Action Buttons ===
  const ActionButton = ({
    icon,
    label,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group flex-1"
    >
      <div className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center group-active:scale-95 backdrop-blur-sm">
        {icon}
      </div>
      <span className="text-xs font-medium text-white/90">{label}</span>
    </button>
  );

  // === Navigation Items (Mobile) ===
  const navItems = [
    { icon: <Home size={20} />, label: "Home", path: "/user/dashboard" },
    { icon: <History size={20} />, label: "Activity", path: "/user/transactions" },
    { icon: <TrendingUp size={20} />, label: "Invest", path: "/user/plans" },
    { icon: <UserCircle size={20} />, label: "Account", path: "/user/kyc" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===== Header ===== */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="px-4 sm:px-6 py-3 flex justify-between items-center max-w-7xl mx-auto">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => (window.location.href = "/user/dashboard")}
          >
            <img src={assets.cashapp_logo} alt="Logo" className="w-15 h-15 rounded-full" />
            <span className="text-xl font-bold text-gray-900">
              CashApp<span className="text-green-600">Invest</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div ref={notificationsRef} className="relative">
              <button
                className="relative p-2 rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setShowNotifications((s) => !s);
                  setShowProfileMenu(false);
                }}
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center">
                        <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No notifications</p>
                      </div>
                    ) : (
                      <>
                        {(() => {
                          const perPage = 3;
                          const totalPages = Math.ceil(notifications.length / perPage);
                          const startIndex = (page - 1) * perPage;
                          const current = notifications.slice(startIndex, startIndex + perPage);

                          return (
                            <>
                              {current.map((n) => (
                                <div
                                  key={n._id}
                                  className={`p-4 border-b border-gray-50 ${
                                    !n.read ? "bg-green-50" : ""
                                  }`}
                                >
                                  <p className="font-medium text-sm text-gray-900">{n.title}</p>
                                  <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                                  <p className="text-[10px] text-gray-400 mt-2">
                                    {new Date(n.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                              {totalPages > 1 && (
                                <div className="p-3 flex justify-between items-center border-t border-gray-100">
                                  <button
                                    className={`px-3 py-1 text-sm rounded-lg ${
                                      page === 1
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "hover:bg-gray-100"
                                    }`}
                                    onClick={() => page > 1 && setPage(page - 1)}
                                    disabled={page === 1}
                                  >
                                    Previous
                                  </button>
                                  <span className="text-xs text-gray-500">
                                    Page {page} of {totalPages}
                                  </span>
                                  <button
                                    className={`px-3 py-1 text-sm rounded-lg ${
                                      page === totalPages
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "hover:bg-gray-100"
                                    }`}
                                    onClick={() => page < totalPages && setPage(page + 1)}
                                    disabled={page === totalPages}
                                  >
                                    Next
                                  </button>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div ref={profileRef} className="relative">
              <button
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setShowProfileMenu((s) => !s);
                  setShowNotifications(false);
                }}
              >
                <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
                  <User size={18} className="text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {user?.name ? user.name.trim().split(/\s+/)[0] : "User"}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      onClick={() => navigate("/user/kyc")}
                    >
                      <Settings size={16} /> KYC Verification
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                      onClick={() => navigate("/user/change-password")}
                    >
                      <KeyRound size={16} /> Change Password
                    </button>
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 border-t border-gray-100 mt-1 pt-2"
                      onClick={logout}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name ? user.name.split(" ")[0] : "User"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage your investments and track your earnings</p>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Balance</p>
              <p className="text-4xl font-bold text-white mt-1">
                ${balances.accountBalance.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <ActionButton
              icon={<ArrowDownCircle className="w-6 h-6 text-white" />}
              label="Add Money"
              onClick={() => navigate("/user/deposit")}
            />
            <ActionButton
              icon={<ArrowUpCircle className="w-6 h-6 text-white" />}
              label="Cash Out"
              onClick={() => navigate("/user/withdraw")}
            />
            <ActionButton
              icon={<TrendingUp className="w-6 h-6 text-white" />}
              label="Invest"
              onClick={() => navigate("/user/plans")}
            />
          </div>
        </div>

        {/* Wallet Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Main Wallet</span>
              <Wallet className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-xl font-bold text-gray-900">
              ${balances.mainWallet.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Profit Wallet</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-xl font-bold text-gray-900">
              ${balances.profitWallet.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Referral Section */}
        <div className="bg-gradient-to-r from-green-50 to-white rounded-2xl p-5 mb-6 border border-green-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-900">Invite friends, earn bonuses</span>
            </div>
            <span className="text-sm text-green-600 font-semibold">
              +${stats.referralBonus || 0} earned
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              value={referralCode}
              readOnly
              className="flex-1 text-sm bg-white border-green-200 focus:border-green-400 rounded-xl"
            />
            <Button
              variant="primary"
              onClick={copyReferral}
              className="px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Share your code and earn rewards when friends join
          </p>
        </div>

        {/* Stats Grid - Clickable Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {/* Total Transactions - Clickable to Transactions Page */}
          <div 
            onClick={() => navigate("/user/transactions")}
            className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all hover:border-green-200 hover:bg-green-50/30"
          >
            <div className="flex items-center justify-between mb-1">
              <Receipt className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-400">Total</span>
            </div>
            <p className="font-bold text-gray-900 text-lg">{stats.allTransactions || 0}</p>
            <p className="text-xs text-gray-500">Transactions</p>
          </div>

          {/* Deposits */}
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-400">Deposits</span>
            </div>
            <p className="font-bold text-gray-900 text-lg">${(stats.totalDeposit || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total deposited</p>
          </div>

          {/* Invested - Clickable to Plans Page */}
          <div 
            onClick={() => navigate("/user/plans")}
            className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all hover:border-green-200 hover:bg-green-50/30"
          >
            <div className="flex items-center justify-between mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-400">Invested</span>
            </div>
            <p className="font-bold text-gray-900 text-lg">${(stats.totalInvestment || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Active investments</p>
          </div>

          {/* Profit */}
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <Coins className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-400">Profit</span>
            </div>
            <p className="font-bold text-gray-900 text-lg">${(stats.totalProfit || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total earned</p>
          </div>
        </div>

        {/* Investment Calculator */}
        <div className="mb-6">
          <InvestmentCalculator />
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Recent Activity</h2>
              <button
                onClick={() => navigate("/user/transactions")}
                className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 font-medium"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 text-green-500 animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No transactions yet</p>
              </div>
            ) : (
              transactions.map((t) => (
                <div key={t._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      {getIcon(t)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{formatType(t)}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-gray-400">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(t.status)}
                          <span className="text-xs text-gray-500 capitalize">{t.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {renderAmount(t)}
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{t.reference.slice(0, 8)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* ===== Bottom Navigation (Mobile) ===== */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 md:hidden z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center py-2 px-3 rounded-xl transition-colors hover:bg-gray-50 active:bg-gray-100"
            >
              <div className= "text-gray-500">
                {item.icon}
              </div>
              <span className= "text-xs mt-1">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}