// client/src/components/user/Create.tsx

import { useEffect, useState } from "react";
import API from "../../lib/api";
import Card from "../common/Card";
import { format } from "date-fns";
import { UserRoundPlus, ArrowUpLeft, TrendingUp, DollarSign, CheckCircle, Clock } from "lucide-react";

interface Investment {
  _id: string;
  planName: string;
  amount: number;
  roi: number;
  createdAt: string;
  status: "pending" | "success" | "failed" | "completed";
  title: string;
  date?: string;
  net?: string;
  total?: string;
}

interface Withdraw {
  _id: string;
  amount: number;
  createdAt: string;
  status: "pending" | "success" | "failed";
  title: string;
  date?: string;
  net?: string;
  total?: string;
}

export default function Create() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [withdraws, setWithdraws] = useState<Withdraw[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const [invRes, wRes] = await Promise.all([
        API.get("/spotlights?type=investment"),
        API.get("/spotlights?type=withdraw"),
      ]);

      const invData = Array.isArray(invRes.data)
        ? invRes.data
        : invRes.data?.data || [];
      const wData = Array.isArray(wRes.data)
        ? wRes.data
        : wRes.data?.data || [];

      setInvestments(invData);
      setWithdraws(wData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
      case "completed":
        return <CheckCircle className="w-3 h-3" />;
      case "pending":
        return <Clock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest Activity
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            See what other investors are doing on our platform
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Investments */}
            <Card className="p-6 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Investments</h3>
              </div>
              <div className="space-y-3">
                {investments.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-8">
                    No recent investments
                  </div>
                ) : (
                  investments.map((it) => (
                    <div
                      key={it._id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <UserRoundPlus size={18} className="text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{it.title}</div>
                          <div className="text-xs text-gray-500">
                            {it.createdAt
                              ? format(new Date(it.createdAt), "MMM dd, yyyy HH:mm")
                              : ""}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(it.status)}`}>
                        {getStatusIcon(it.status)}
                        {it.status}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">
                          +${it.amount?.toLocaleString() || "0"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Recent Withdrawals */}
            <Card className="p-6 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <DollarSign className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Withdrawals</h3>
              </div>
              <div className="space-y-3">
                {withdraws.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-8">
                    No recent withdrawals
                  </div>
                ) : (
                  withdraws.map((it) => (
                    <div
                      key={it._id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <ArrowUpLeft size={18} className="text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{it.title}</div>
                          <div className="text-xs text-gray-500">
                            {it.createdAt
                              ? format(new Date(it.createdAt), "MMM dd yyyy HH:mm")
                              : ""}
                          </div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(it.status)}`}>
                        {getStatusIcon(it.status)}
                        {it.status}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          -${it.amount?.toLocaleString() || "0"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}