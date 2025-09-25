// src/components/admin/Referral.tsx
import { useState } from "react";
import Table from "../common/Table";
import type { Column } from "../common/Table"; // <-- assuming Table exports PaginatedData type

export interface ReferralUser {
  _id: string;
  name: string;
  email: string;
  referredBy?: {
    _id: string;
    email: string;
  };
}

interface ReferralProps {
  users: ReferralUser[];
}

export default function Referral({ users }: ReferralProps) {
  const [view, setView] = useState<"table" | "tree">("table");

  // Build children map
  const childrenMap: Record<string, ReferralUser[]> = {};
  users.forEach((u) => {
    if (u.referredBy?._id) {
      childrenMap[u.referredBy._id] = [
        ...(childrenMap[u.referredBy._id] || []),
        u,
      ];
    }
  });

  const roots = users.filter((u) => !u.referredBy);

  function renderNode(user: ReferralUser) {
    const childCount = childrenMap[user._id]?.length || 0;
    return (
      <li key={user._id} className="mb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <div className="text-sm sm:text-base break-words">
            <span className="font-medium text-gray-800">{user.name}</span>{" "}
            <span className="text-gray-500 text-xs sm:text-sm break-all">
              ({user.email})
            </span>
          </div>
          {childCount > 0 && (
            <span className="inline-block text-[10px] sm:text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium mt-1 sm:mt-0">
              {childCount} referral{childCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {childrenMap[user._id] && (
          <ul className="ml-3 sm:ml-6 mt-2 border-l pl-3 sm:pl-6 space-y-2">
            {childrenMap[user._id].map(renderNode)}
          </ul>
        )}
      </li>
    );
  }

  // Table columns
  const columns: Column<ReferralUser>[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    {
      key: "referredBy",
      header: "Referred By",
      render: (row) => row.referredBy?.email || "—",
    },
  ];

  return (
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* Toggle Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setView(view === "table" ? "tree" : "table")}
          className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Switch to {view === "table" ? "Tree View" : "Table View"}
        </button>
      </div>

      {/* Table View */}
      {view === "table" && (
        <div className="w-full">
          {/* Mobile card list reusing Table pagination */}
          <div className="sm:hidden">
            <Table<ReferralUser>
              data={users}
              columns={columns}
              pageSize={5}
              renderRow={(user: ReferralUser) => (
                <div
                  key={user._id}
                  className="p-3 mb-3 rounded-lg border bg-white shadow-sm"
                >
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-gray-600 break-all">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    Referred By: {user.referredBy?.email || "—"}
                  </p>
                </div>
              )}
            />
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table<ReferralUser> data={users} columns={columns} pageSize={10} />
          </div>
        </div>
      )}

      {/* Tree View */}
      {view === "tree" && (
        <div className="p-3 sm:p-4 rounded-lg border bg-gray-50 w-full">
          <ul className="space-y-2">{roots.map(renderNode)}</ul>
        </div>
      )}
    </div>
  );
}
