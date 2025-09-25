// src/components/admin/Reward.tsx
import Table from "../common/Table";
import type { Column } from "../common/Table";

interface Reward {
  _id: string;
  user: { email: string };
  type: "earning" | "redeem";
  points: number;
  createdAt: string;
}

interface RewardProps {
  rewards: Reward[];
}

export default function RewardTable({ rewards }: RewardProps) {
  const columns: Column<Reward>[] = [
    {
      key: "user",
      header: "User Email",
      render: (row) => row.user?.email || "N/A",
    },
    { key: "type", header: "Type" },
    { key: "points", header: "Points" },
    {
      key: "createdAt",
      header: "Date",
      render: (row) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4">
      <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Reward History</h2>

      {/* Mobile Card List */}
      <div className="block sm:hidden space-y-3">
        {rewards.length === 0 ? (
          <p className="text-gray-500 text-sm">No rewards found.</p>
        ) : (
          rewards.map((r) => (
            <div
              key={r._id}
              className="border rounded-lg p-3 flex flex-col gap-1 text-sm"
            >
              <p><span className="font-medium">Email:</span> {r.user?.email || "N/A"}</p>
              <p><span className="font-medium">Type:</span> {r.type}</p>
              <p><span className="font-medium">Points:</span> {r.points}</p>
              <p>
                <span className="font-medium">Date:</span>{" "}
                {new Date(r.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <Table data={rewards} columns={columns} pageSize={10} />
      </div>
    </div>
  );
}
