// client/src/components/admin/Transactions.tsx
import { useEffect, useState } from "react";
import API from "../../lib/api";
import Table from "../common/Table";
import type { Column } from "../common/Table";
import Loader from "../common/Loader";
import Select from "../common/Select";
import Button from "../common/Button";
import { toast } from "react-toastify";

interface User {
  _id: string;
  username: string;
  email: string;
}

interface Plan {
  _id: string;
  name: string;
}

export interface Transaction {
  _id: string;
  user: User;
  plan?: Plan;
  type: string;
  amount: number;
  status: string;
  reference: string;
  createdAt: string;
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ type: "", status: "" });

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/transactions");
      setTransactions(data);
    } catch {
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await API.put(`/transactions/${id}/status`, { status });
      toast.success(`Transaction marked as ${status}`);
      fetchTransactions();
    } catch {
      toast.error("Failed to update transaction status");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    return (
      (!filters.type || t.type === filters.type) &&
      (!filters.status || t.status === filters.status)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedData = filteredTransactions.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const columns: Column<Transaction>[] = [
    { key: "reference", header: "Reference" },
    {
      key: "user",
      header: "User",
      render: (row) => row.user?.username || "N/A",
    },
    {
      key: "plan",
      header: "Plan",
      render: (row) => row.plan?.name || "-",
    },
    { key: "type", header: "Type" },
    {
      key: "amount",
      header: "Amount",
      render: (row) => `$${row.amount}`,
    },
    { key: "status", header: "Status" },
    {
      key: "createdAt",
      header: "Date",
      render: (row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      key: "actions" as keyof Transaction,
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          {row.status === "pending" && (
            <>
              <Button
                variant="primary"
                onClick={() => updateStatus(row._id, "completed")}
              >
                Complete
              </Button>
              <Button
                variant="danger"
                onClick={() => updateStatus(row._id, "failed")}
              >
                Fail
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end">
        <Select
          label="Filter by Type"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          options={[
            { value: "", label: "All" },
            { value: "deposit", label: "Deposit" },
            { value: "withdrawal", label: "Withdrawal" },
            { value: "investment", label: "Investment" },
            { value: "profit", label: "Profit" },
            { value: "roi", label: "ROI" },
            { value: "bonus", label: "Bonus" },
          ]}
        />
        <Select
          label="Filter by Status"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          options={[
            { value: "", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "completed", label: "Completed" },
            { value: "failed", label: "Failed" },
          ]}
        />
        <Button variant="secondary" onClick={fetchTransactions}>
          Refresh
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <Loader />
      ) : (
        <>
          <Table<Transaction> data={paginatedData} columns={columns} />

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Prev
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
