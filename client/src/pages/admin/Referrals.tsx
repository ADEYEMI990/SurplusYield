// src/pages/admin/Referrals.tsx
"use client";

import { useEffect, useState } from "react";
import API from "../../lib/api";
import Referral from "../../components/admin/Referral";
import type { ReferralUser } from "../../components/admin/Referral";
import axios from "axios";

export default function AdminReferralPage() {
  const [users, setUsers] = useState<ReferralUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReferrals() {
      try {
        const { data } = await API.get<ReferralUser[]>("/admin/referrals");
        setUsers(data);
      } catch (err: unknown) {
        // Narrow the unknown error safely
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message ?? "Error fetching referrals");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Error fetching referrals");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchReferrals();
  }, []);

  if (loading) return <p>Loading referrals...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-lg sm:text-xl font-bold text-gray-800">Admin Referral Management</h1>
      <Referral users={users} />
    </div>
  );
}