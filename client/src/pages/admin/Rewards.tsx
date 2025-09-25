// src/pages/admin/Rewards.tsx
"use client";
import { useEffect, useState } from "react";
import RewardTable from "../../components/admin/Reward";
import API from "../../lib/api";
import axios from "axios";

interface Reward {
  _id: string;
  user: { email: string };
  type: "earning" | "redeem";
  points: number;
  createdAt: string;
}

export default function RewardPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filtered, setFiltered] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "earning" | "redeem">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const { data } = await API.get("/admin/rewards");
        setRewards(data);
        setFiltered(data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message ?? "Failed to fetch rewards");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch rewards");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, []);

  // Apply filter + search
  useEffect(() => {
    let results = rewards;

    if (filter !== "all") {
      results = results.filter((r) => r.type === filter);
    }

    if (search.trim() !== "") {
      results = results.filter((r) =>
        r.user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(results);
  }, [filter, search, rewards]);

  if (loading) return <p className="p-4">Loading rewards...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-3 sm:p-4 space-y-4">
      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <label htmlFor="reward-filter" className="font-medium text-sm sm:text-base">
            Filter:
          </label>
          <select
            id="reward-filter"
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | "earning" | "redeem")
            }
            className="border rounded px-3 py-1 text-sm sm:text-base w-full sm:w-auto"
          >
            <option value="all">All</option>
            <option value="earning">Earnings</option>
            <option value="redeem">Redeems</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto sm:ml-auto">
          <label htmlFor="reward-search" className="font-medium text-sm sm:text-base">
            Search:
          </label>
          <input
            id="reward-search"
            type="text"
            placeholder="Search by email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-3 py-1 text-sm sm:text-base w-full sm:w-64"
          />
        </div>
      </div>

      {/* Reward Table */}
      <RewardTable rewards={filtered} />
    </div>
  );
}
