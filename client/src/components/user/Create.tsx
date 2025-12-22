// client/src/components/user/Create.tsx
import { useEffect, useState } from "react";
import API from "../../lib/api";
import Card from "../common/Card";
import { format } from "date-fns";
import { UserRoundPlus, ArrowUpLeft } from "lucide-react";

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

export default function UserCreate() {
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

      // ✅ Ensure arrays no matter the response shape
    const invData = Array.isArray(invRes.data)
      ? invRes.data
      : invRes.data?.data || [];
    const wData = Array.isArray(wRes.data)
      ? wRes.data
      : wRes.data?.data || [];

      setInvestments(invData);
      setWithdraws(wData);

      console.log("Investment Response:", invRes.data);
      console.log("Withdraw Response:", wRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <section className="section-style-2 light-blue-bg py-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h4 className="text-lg font-medium">
            Latest Investors and Withdraws
          </h4>
          <h2 className="text-2xl font-bold">
            You can explore the live investments and withdraws
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">Recent Investments</h3>
              <div className="space-y-3">
                {investments.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No recent investments
                  </div>
                ) : (
                  investments.map((it) => (
                    <div
                      key={it._id}
                      className="flex items-center justify-between border-b py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <UserRoundPlus size={20} />
                        </div>
                        <div>
                          <div className="font-medium">{it.title}</div>
                          <div className="text-xs text-gray-500">
                            {it.createdAt
                              ? format(new Date(it.createdAt), "MMM dd, yyyy HH:mm")
                              : ""}
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-700 rounded-full px-3 py-1 text-white">
                        {it.status}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-green-600">
                          {"+0 USD"}
                        </div>
                        <div className="font-medium">
                          {it.total || (it.amount ? `${it.amount} USD` : "")}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-3">Recent Withdraws</h3>
              <div className="space-y-3">
                {withdraws.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No recent withdraws
                  </div>
                ) : (
                  withdraws.map((it) => (
                    <div
                      key={it._id}
                      className="flex items-center justify-between border-b py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <ArrowUpLeft  size={20} />
                        </div>
                        <div>
                          <div className="font-medium">{it.title}</div>
                          <div className="text-xs text-gray-500">
                            {it.createdAt
                              ? format(new Date(it.createdAt), "MMM dd yyyy HH:mm")
                              : ""}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-white bg-green-700 rounded-full px-3 py-1">
                          {it.status}
                        </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {it.total || (it.amount ? `${it.amount} USD` : "")}
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
