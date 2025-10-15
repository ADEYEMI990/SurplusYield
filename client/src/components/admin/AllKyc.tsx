import { useEffect, useState } from "react";
import { X, Eye } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../lib/api";

interface Submission {
  _id: string;
  user: { name: string; email: string };
  form: { name: string };
  status: "pending" | "approved" | "rejected";
  reason?: string;
  fields: { label: string; value: string }[];
  createdAt: string;
  updatedAt: string;
}

export default function AllKyc() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filtered, setFiltered] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [reason, setReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // === Fetch all KYC submissions ===
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
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

  // === Filter Logic ===
  useEffect(() => {
    if (!filter) setFiltered(submissions);
    else
      setFiltered(
        submissions.filter((s) =>
          filter === "verified" ? s.status === "approved" : s.status === filter
        )
      );
    setCurrentPage(1);
  }, [filter, submissions]);

  // === Approve / Reject Handler ===
  const handleStatusUpdate = async (
    id: string,
    status: "approved" | "rejected"
  ) => {
    try {
      await API.put(`/kyc/admin/submissions/${id}/status`, { status, reason });
      toast.success(`KYC ${status}`);
      setReason("");
      setSelected(null);
      fetchSubmissions();
    } catch {
      toast.error("Action failed");
    }
  };

  // === Pagination Logic ===
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 sm:p-6 bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold mb-3 sm:mb-0">
          ALL KYC Requests
        </h2>
        <select
          title="Filter by Status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-300"
        >
          <option value="">Filter by Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* === Desktop Table === */}
      <div className="hidden md:block bg-gray-50 rounded-lg border shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : currentData.length === 0 ? (
          <p className="p-4 text-gray-500">No submissions found.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
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
                <tr key={s._id} className="border-t hover:bg-gray-50">
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
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        s.status === "approved"
                          ? "bg-green-100 text-green-700 border border-green-400"
                          : s.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-400"
                            : "bg-red-100 text-red-700 border border-red-400"
                      }`}
                    >
                      {s.status}
                    </span>

                    {/* ✅ Show "Resubmitted" tag if it was previously rejected and now pending */}
                    {s.status === "pending" &&
                      new Date(s.updatedAt).getTime() -
                        new Date(s.createdAt).getTime() >
                        5000 && ( // 5s threshold to ignore initial creation
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full border border-blue-300">
                          Resubmitted
                        </span>
                      )}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      title="View Details"
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

      {/* === Mobile Stacked Cards === */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <p>Loading...</p>
        ) : currentData.length === 0 ? (
          <p className="text-gray-500">No submissions found.</p>
        ) : (
          currentData.map((s) => (
            <div
              key={s._id}
              className="border rounded-lg p-4 bg-gray-50 shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm text-gray-500">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                  <p className="font-semibold text-gray-800">{s.user?.name}</p>
                  <p className="text-xs text-gray-500">{s.user?.email}</p>
                </div>
                <button
                  title="View Details"
                  onClick={() => {
                    setSelected(s);
                    setReason(s.reason || "");
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Eye size={20} />
                </button>
              </div>
              <p className="text-sm">
                <span className="font-medium">TYPE:</span> {s.form?.name}
              </p>
              <div className="mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    s.status === "approved"
                      ? "bg-green-100 text-green-700 border border-green-400"
                      : s.status === "pending"
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-400"
                        : "bg-red-100 text-red-700 border border-red-400"
                  }`}
                >
                  {s.status}
                </span>

                {/* ✅ Show "Resubmitted" tag if it was previously rejected and now pending */}
                {s.status === "pending" &&
                  new Date(s.updatedAt).getTime() -
                    new Date(s.createdAt).getTime() >
                    5000 && ( // 5s threshold to ignore initial creation
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full border border-blue-300">
                      Resubmitted
                    </span>
                  )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center mt-4">
          <button
            className="px-3 py-1 border rounded mr-2 text-sm disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 border rounded ml-2 text-sm disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* === Popup Card === */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[95%] sm:w-full max-w-lg p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">KYC DETAILS</h3>
              <button
                title="Close"
                onClick={() => {
                  setSelected(null);
                  setReason("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={22} />
              </button>
            </div>

            {/* === FIELD DETAILS === */}
            <div className="bg-gray-50 border rounded-lg p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {selected.fields.map((f, i) => (
                <div key={i} className="border p-3 rounded-lg bg-gray-50">
                  <p className="font-semibold text-gray-700 mb-1">{f.label}</p>

                  {f.value ? (
                    /\.(jpg|jpeg|png|gif|webp)$/i.test(f.value) ? (
                      <img
                        src={f.value}
                        alt={f.label}
                        className="w-full max-w-xs rounded-md border object-cover transition-transform duration-200 hover:scale-105"
                      />
                    ) : f.value.endsWith(".pdf") ? (
                      <a
                        href={f.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        View PDF
                      </a>
                    ) : (
                      <p className="text-gray-600 break-words">{f.value}</p>
                    )
                  ) : (
                    <p className="text-gray-400 italic">No file uploaded</p>
                  )}
                </div>
              ))}

              {/* Show reason if rejected */}
              {selected.reason && selected.status === "rejected" && (
                <div className="border p-3 rounded-lg bg-red-50 text-red-700 mt-3">
                  <p className="font-semibold mb-1">Rejection Reason:</p>
                  <p className="text-sm">{selected.reason}</p>
                </div>
              )}
            </div>

            {/* === Action Buttons === */}
            {selected.status === "pending" && (
              <div className="mt-6 space-y-3">
                <textarea
                  placeholder="Optional reason for rejection"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleStatusUpdate(selected._id, "approved")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selected._id, "rejected")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
