import { useState } from "react";
import Table from "../common/Table";
import type { Column } from "../common/Table";

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

  // Build children map for tree
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
    return (
      <li key={user._id}>
        <span className="font-medium">{user.name}</span> ({user.email})
        {childrenMap[user._id] && (
          <ul className="ml-6 list-disc">
            {childrenMap[user._id].map(renderNode)}
          </ul>
        )}
      </li>
    );
  }

  // Define table columns
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
    <div>
      {/* Toggle Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setView(view === "table" ? "tree" : "table")}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Switch to {view === "table" ? "Tree View" : "Table View"}
        </button>
      </div>

      {/* Table View (with pagination) */}
      {view === "table" && <Table<ReferralUser> data={users} columns={columns} pageSize={10} />}

      {/* Tree View */}
      {view === "tree" && (
        <div className="p-4 border rounded">
          <ul>{roots.map(renderNode)}</ul>
        </div>
      )}
    </div>
  );
}
