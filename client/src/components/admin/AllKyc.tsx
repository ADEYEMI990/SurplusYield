// client/src/components/admin/AllKyc.tsx

import { useEffect, useState } from "react";
import { Eye, X } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../lib/api";

/* ================= TYPES ================= */

interface Submission {
  id: string;
  user?: { name?: string; email?: string };
  form?: { name?: string };
  status: "pending" | "approved" | "rejected";
  reason?: string;
  fields: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

/* ================= COMPONENT ================= */

export default function AllKyc() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filtered, setFiltered] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("");
  const [reason, setReason] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  /* ================= FETCH DATA ================= */

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      const res = await API.get("/kyc/admin/submissions");

      setSubmissions(res.data);
      setFiltered(res.data);
    } catch {
      toast.error("Failed to fetch KYC submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  /* ================= FILTER ================= */

  useEffect(() => {
    if (!filter) {
      setFiltered(submissions);
    } else {
      setFiltered(
        submissions.filter((s) =>
          filter === "verified"
            ? s.status === "approved"
            : s.status === filter
        )
      );
    }

    setCurrentPage(1);
  }, [filter, submissions]);

  /* ================= UPDATE STATUS ================= */

  const updateStatus = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    try {
      await API.put(`/kyc/admin/submissions/${id}/status`, {
        status,
        reason,
      });

      toast.success(`KYC ${status}`);

      setSelected(null);
      setReason("");

      fetchSubmissions();
    } catch {
      toast.error("Action failed");
    }
  };

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const currentData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ================= STATUS BADGE ================= */

  const statusBadge = (status: Submission["status"]) => {
    if (status === "approved")
      return "bg-green-100 text-green-700 border border-green-400";

    if (status === "pending")
      return "bg-yellow-100 text-yellow-700 border border-yellow-400";

    return "bg-red-100 text-red-700 border border-red-400";
  };

  /* ================= RENDER ================= */

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-sm">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold mb-3 sm:mb-0">
          ALL KYC Requests
        </h2>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Filter by Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}

      <div className="hidden md:block border rounded-lg overflow-hidden">

        {loading ? (
          <p className="p-4">Loading...</p>
        ) : currentData.length === 0 ? (
          <p className="p-4 text-gray-500">No submissions found.</p>
        ) : (
          <table className="min-w-full text-sm">

            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">DATE</th>
                <th className="px-4 py-2 text-left">USER</th>
                <th className="px-4 py-2 text-left">TYPE</th>
                <th className="px-4 py-2 text-left">STATUS</th>
                <th className="px-4 py-2 text-left">ACTION</th>
              </tr>
            </thead>

            <tbody>
              {currentData.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50">

                  <td className="px-4 py-2">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-2">
                    <p className="font-medium">
                      {s.user?.name || "Unknown User"}
                    </p>

                    <p className="text-xs text-gray-500">
                      {s.user?.email || "N/A"}
                    </p>
                  </td>

                  <td className="px-4 py-2">
                    {s.form?.name || "Unknown Form"}
                  </td>

                  <td className="px-4 py-2">
                    <span
                      className={`px-3 py-1 text-xs rounded-full capitalize ${statusBadge(
                        s.status
                      )}`}
                    >
                      {s.status}
                    </span>
                  </td>

                  <td className="px-4 py-2">
                    <button
                      onClick={() => {
                        setSelected(s);
                        setReason(s.reason || "");
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Eye size={20} />
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>

      {/* ================= PAGINATION ================= */}

      {totalPages > 1 && (
        <div className="flex justify-end mt-4 gap-2">

          <button
            onClick={() =>
              setCurrentPage((p) => Math.max(p - 1, 1))
            }
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded text-sm"
          >
            Prev
          </button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded text-sm"
          >
            Next
          </button>

        </div>
      )}

      {/* ================= MODAL ================= */}

      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl w-[95%] sm:w-full max-w-lg p-6 relative">

            {/* HEADER */}

            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-semibold">KYC DETAILS</h3>

              <button
                onClick={() => {
                  setSelected(null);
                  setReason("");
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* FIELDS */}

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">

              {Object.entries(selected.fields || {}).map(
                ([label, value], i) => (
                  <div
                    key={i}
                    className="border rounded-lg p-3 bg-gray-50"
                  >
                    <p className="font-semibold mb-1">{label}</p>

                    {value ? (
                      /\.(jpg|jpeg|png|gif|webp)$/i.test(value) ? (
                        <img
                          src={value}
                          alt={label}
                          className="max-w-xs rounded border"
                        />
                      ) : value.endsWith(".pdf") ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View PDF
                        </a>
                      ) : (
                        <p className="break-words">{value}</p>
                      )
                    ) : (
                      <p className="text-gray-400">
                        No value provided
                      </p>
                    )}
                  </div>
                )
              )}

              {selected.reason &&
                selected.status === "rejected" && (
                  <div className="border p-3 rounded bg-red-50 text-red-700">
                    <p className="font-semibold">
                      Rejection Reason
                    </p>
                    <p>{selected.reason}</p>
                  </div>
                )}
            </div>

            {/* ACTIONS */}

            {selected.status === "pending" && (
              <div className="mt-6 space-y-3">

                <textarea
                  placeholder="Optional reason for rejection"
                  className="w-full border rounded px-3 py-2"
                  value={reason}
                  onChange={(e) =>
                    setReason(e.target.value)
                  }
                />

                <div className="flex justify-end gap-3">

                  <button
                    onClick={() =>
                      updateStatus(selected.id, "approved")
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(selected.id, "rejected")
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Reject
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}