"use client";
import { useEffect, useState } from "react";
import API from "../../lib/api";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader";
import Card, { CardContent, CardTitle } from "../../components/common/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ✅ Interface for admin dashboard stats
interface DashboardStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalInvestments: number;
  totalTransactions: number;
  chartData: {
    date: string;
    deposits: number;
    withdrawals: number;
    investments: number;
  }[];
}

// ✅ Dashboard Component
function AdminDashboardComponent({
  data,
  loading,
}: {
  data: DashboardStats | null;
  loading: boolean;
}) {
  if (loading) return <Loader />;

  if (!data)
    return (
      <div className="text-center py-10 text-gray-500">No data available</div>
    );

  return (
    <div className="space-y-8">
      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 text-gray-800 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="text-center border-t-4 border-blue-600">
          <CardTitle>Total Users</CardTitle>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalUsers}</p>
          </CardContent>
        </Card>

        <Card className="text-center border-t-4 border-green-600">
          <CardTitle>Total Deposits</CardTitle>
          <CardContent>
            <p className="text-2xl font-bold">${data.totalDeposits || 0}</p>
          </CardContent>
        </Card>

        <Card className="text-center border-t-4 border-red-600">
          <CardTitle>Total Withdrawals</CardTitle>
          <CardContent>
            <p className="text-2xl font-bold">${data.totalWithdrawals || 0}</p>
          </CardContent>
        </Card>

        <Card className="text-center border-t-4 border-indigo-600">
          <CardTitle>Total Investments</CardTitle>
          <CardContent>
            <p className="text-2xl font-bold">${data.totalInvestments || 0}</p>
          </CardContent>
        </Card>

        <Card className="text-center border-t-4 border-yellow-500">
          <CardTitle>All Transactions</CardTitle>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalTransactions}</p>
          </CardContent>
        </Card>
      </div>

      {/* --- Transaction Trends Chart --- */}
      <Card className="mt-6">
        <CardTitle className="mb-4">Transaction Trends</CardTitle>
        <CardContent>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="date" stroke="#333" />
                <YAxis stroke="#333" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="deposits"
                  stroke="#22c55e"
                  name="Deposits"
                />
                <Line
                  type="monotone"
                  dataKey="withdrawals"
                  stroke="#ef4444"
                  name="Withdrawals"
                />
                <Line
                  type="monotone"
                  dataKey="investments"
                  stroke="#3b82f6"
                  name="Investments"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ✅ Page Component
export default function Dashboard() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async (): Promise<void> => {
    try {
      const res = await API.get<DashboardStats>("/admin/stats");
      console.log(
        "📦 Admin Stats Response (frontend):",
        JSON.stringify(res.data, null, 2)
      );
      setData(res.data);
    } catch (err: unknown) {
      console.error("Failed to fetch admin stats:", err);
      if (err instanceof Error) {
        toast.error("Failed to load stats");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="bg-blue-700 text-white p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      </div>

      {/* Page content container */}
      <div className="bg-blue-600 text-white p-6 rounded-lg shadow-md">
        <p>Welcome to your dashboard! Here’s an overview of your system.</p>
      </div>
      <AdminDashboardComponent data={data} loading={loading} />
    </div>
  );
}
