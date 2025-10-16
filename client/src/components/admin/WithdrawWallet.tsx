import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../lib/api";

interface Wallet {
  _id: string;
  btcAddress: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  updatedAt: string;
}

export default function WithdrawWallet() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/withdraw-wallet");
        setWallets(data);
      } catch {
        toast.error("Failed to load wallets");
      } finally {
        setLoading(false);
      }
    };
    fetchWallets();
  }, []);

  if (loading) return <p>Loading wallets...</p>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">User Withdrawal Wallets</h2>

      {wallets.length === 0 ? (
        <p>No wallets found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">BTC Address</th>
                <th className="p-2 border">Updated At</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((w) => (
                <tr key={w._id} className="border-b">
                  <td className="p-2 border">{w.userId?.name || "N/A"}</td>
                  <td className="p-2 border">{w.userId?.email || "N/A"}</td>
                  <td className="p-2 border truncate max-w-xs">{w.btcAddress}</td>
                  <td className="p-2 border">
                    {new Date(w.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}