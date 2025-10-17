//

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Settings,
  KeyRound,
  LogOut,
  Copy,
  User,
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
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import { CardContent, CardHeader, CardTitle } from "../common/Card";
import Card from "../common/Card";
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
    if (t.type === "bonus") return <Gift className="w-5 h-5 text-purple-500" />;
    if (t.type === "deposit")
      return <ArrowUpCircle className="w-5 h-5 text-green-500" />;
    if (t.type === "withdrawal")
      return <ArrowDownCircle className="w-5 h-5 text-red-500" />;
    if (t.type === "investment")
      return <PiggyBank className="w-5 h-5 text-blue-500" />;
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
    if (t.type === "deposit" || t.type === "bonus") {
      return (
        <span className="text-green-600 flex items-center space-x-1">
          <ArrowUpCircle className="w-4 h-4" />
          <span>+{t.amount} USD</span>
        </span>
      );
    }
    if (t.type === "withdrawal") {
      return (
        <span className="text-red-600 flex items-center space-x-1">
          <ArrowDownCircle className="w-4 h-4" />
          <span>-{t.amount} USD</span>
        </span>
      );
    }
    return <span>{t.amount} USD</span>;
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

  // === Summary Cards ===
  const summaryCards = [
    {
      title: "All Transactions",
      value: stats.allTransactions || 0,
      icon: <Receipt size={22} />,
      onClick: () => navigate("/user/transactions"),
    },
    {
      title: "Total Deposit",
      value: `$${stats.totalDeposit || 0}`,
      icon: <DollarSign size={22} />,
      onClick: () => navigate("/user/deposit"),
    },
    {
      title: "Total Investment",
      value: `$${stats.totalInvestment || 0}`,
      icon: <TrendingUp size={22} />,
      onClick: () => navigate("/user/plans"),
    },
    {
      title: "Total Profit",
      value: `$${stats.totalProfit || 0}`,
      icon: <Coins size={22} />,
    },
    {
      title: "Total Withdraw",
      value: `$${stats.totalWithdraw || 0}`,
      icon: <ArrowUpCircle size={22} />,
    },
    {
      title: "Referral Bonus",
      value: `$${stats.referralBonus || 0}`,
      icon: <Gift size={22} />,
    },
    {
      title: "Deposit Bonus",
      value: `$${stats.depositBonus || 0}`,
      icon: <DollarSign size={22} />,
    },
    {
      title: "Investment Bonus",
      value: `$${stats.investmentBonus || 0}`,
      icon: <TrendingUp size={22} />,
    },
    {
      title: "Total Referrals",
      value: stats.totalReferrals || 0,
      icon: <Users size={22} />,
    },
  ];

  const SummaryCard = ({
    title,
    value,
    icon,
    onClick,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    onClick?: () => void;
  }) => (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-100"
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

  const renderSummaryCards = () =>
    summaryCards.map((c, i) => <SummaryCard key={i} {...c} />);

  // === Render ===
  return (
    <div className="px-3 sm:px-6 md:px-8 py-4 space-y-6">
      {/* ===== Navbar ===== */}
      <nav className="bg-white shadow px-4 sm:px-6 py-3 flex justify-between items-center">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => (window.location.href = "/user/dashboard")}
        >
          <img
            src={assets.SY}
            alt="Logo"
            className="w-8 h-8 rounded bg-gray-800"
          />
          <span className="font-bold text-lg">Surplus Yield</span>
        </div>

        <div className="flex items-center gap-4 relative">
          {/* Notifications */}
          <div ref={notificationsRef} className="relative z-40">
            <div
              className="relative cursor-pointer"
              onClick={() => {
                setShowNotifications((s) => !s);
                setShowProfileMenu(false);
              }}
            >
              <Bell className="w-6 h-6 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            {showNotifications && (
              <div
                className="
    absolute 
    sm:right-0 
    -right-full
    mt-2 
    w-72 
    bg-white 
    shadow-lg 
    rounded-lg 
    p-3 
    max-h-80 
    overflow-y-auto 
    z-50 
    sm:translate-x-0 
    sm:origin-top-right 
    origin-top-right
    left-auto
  "
              >
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-600">No new notifications</p>
                ) : (
                  <>
                    {/* === Pagination Logic === */}
                    {(() => {
                      const perPage = 3;
                      const totalPages = Math.ceil(
                        notifications.length / perPage
                      );
                      const startIndex = (page - 1) * perPage;
                      const current = notifications.slice(
                        startIndex,
                        startIndex + perPage
                      );

                      return (
                        <>
                          {current.map((n) => (
                            <div
                              key={n._id}
                              className={`p-2 mb-1 rounded ${
                                n.read ? "bg-gray-50" : "bg-blue-50"
                              }`}
                            >
                              <p className="font-medium text-sm">{n.title}</p>
                              <p className="text-xs text-gray-600">
                                {n.message}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {new Date(n.createdAt).toLocaleString()}
                              </p>
                            </div>
                          ))}

                          {/* Pagination Controls */}
                          {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                              <button
                                className={`px-2 py-1 rounded ${
                                  page === 1
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "hover:bg-gray-200"
                                }`}
                                onClick={() => page > 1 && setPage(page - 1)}
                                disabled={page === 1}
                              >
                                Prev
                              </button>
                              <span>
                                Page {page} of {totalPages}
                              </span>
                              <button
                                className={`px-2 py-1 rounded ${
                                  page === totalPages
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "hover:bg-gray-200"
                                }`}
                                onClick={() =>
                                  page < totalPages && setPage(page + 1)
                                }
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
            )}
          </div>

          <h2 className="text-base sm:text-xl font-bold">
            Hi, {user?.name ? user.name.trim().split(/\s+/)[0] : "User"}
          </h2>

          {/* Profile dropdown */}
          <div ref={profileRef} className="relative z-40">
            <User
              size={32}
              className="text-gray-300 cursor-pointer rounded-full p-1 hover:bg-gray-800"
              onClick={() => {
                setShowProfileMenu((s) => !s);
                setShowNotifications(false);
              }}
            />
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 text-white rounded shadow-lg z-50">
                <ul className="divide-y divide-gray-700">
                  <li
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                    onClick={() => navigate("/user/kyc")}
                  >
                    <Settings size={16} /> KYC
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

      {/* ===== Referral Section ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-1/2 sm:w-72 ">
            <Input
              value={referralCode}
              readOnly
              className="pr-12 text-sm focus:ring-2 focus:ring-indigo-500"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={copyReferral}
              className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-gray-700 hover:text-white rounded-full"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ===== HERO SECTION ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SECTION */}
        <div className="bg-white shadow rounded-lg p-4 space-y-4">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Account Balance</h2>
              <Wallet size={28} />
            </div>
            <p className="mt-2 text-3xl font-bold">
              ${balances.accountBalance.toLocaleString()}
            </p>
          </Card>

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

          <div className="flex flex-col sm:flex-row gap-3">
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

        {/* RIGHT SECTION (desktop) */}
        <div className="hidden lg:grid grid-cols-3 gap-4">
          {renderSummaryCards()}
        </div>

        {/* RIGHT SECTION (mobile) */}
        <div className="lg:hidden flex flex-col gap-4 mt-4">
          <Card className="p-4">
            <div className="flex justify-between gap-2 overflow-x-auto">
              {summaryCards.slice(0, 3).map((c, i) => (
                <div key={i} className="flex-1 min-w-[100px]">
                  <SummaryCard {...c} />
                </div>
              ))}
            </div>
          </Card>
          {/* === Remaining 6 boxes (2 per row, 3 rows) === */}
          <Card className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {summaryCards.slice(3).map((c, i) => (
                <SummaryCard key={i} {...c} />
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ===== INVESTMENT CALCULATOR ===== */}
      <InvestmentCalculator />

      {/* ===== RECENT TRANSACTIONS ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500 text-sm">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b text-left">
                  <tr>
                    <th className="py-2 px-4">Description</th>
                    <th className="py-2 px-4 hidden md:table-cell">
                      Transaction ID
                    </th>
                    {/* hide "Type" on mobile */}
                    <th className="py-2 px-4 hidden md:table-cell">Type</th>
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
                      <td className="py-3 px-4 hidden md:table-cell">
                        {t.reference}
                      </td>

                      {/* ✅ Type (hidden on small screens) */}
                      <td className="py-3 px-4 hidden md:table-cell">
                        {formatType(t)}
                      </td>

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
