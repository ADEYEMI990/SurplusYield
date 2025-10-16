import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import API from "../../lib/api";
import Button  from "../common/Button";

export default function Wallet() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data } = await API.get("/wallet");
        setAddress(data.address || "");
      } catch {
        toast.error("Failed to fetch wallet address");
      }
    };
    fetchWallet();
  }, []);

  const handleUpdate = async () => {
    if (!address.trim()) {
      toast.error("Address cannot be empty");
      return;
    }

    try {
      setLoading(true);
      await API.put("/wallet", { address });
      toast.success("Wallet updated successfully");
    } catch {
      toast.error("Failed to update wallet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Admin Wallet Settings</h2>

      <label className="text-sm font-medium">Wallet Address</label>
      <input
      title="wallet"
        type="text"
        className="w-full border rounded-md px-3 py-2 mt-1"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <Button
        onClick={handleUpdate}
        disabled={loading}
        className="mt-4 w-full"
      >
        {loading ? "Updating..." : "Save Wallet"}
      </Button>
    </div>
  );
}
