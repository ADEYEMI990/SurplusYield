// src/components/common/Table.tsx
import React, { useState } from "react";

export type Column<T> =
  | {
      key: keyof T; // real field
      header: string;
      render?: (row: T) => React.ReactNode;
    }
  | {
      key: string; // custom field (not in T)
      header: string;
      render: (row: T) => React.ReactNode; // must render manually
    };

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
}

export default function Table<T>({
  data,
  columns,
  pageSize = 10,
}: TableProps<T>) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key as React.Key}
                  className="border p-2 text-left bg-gray-50 font-semibold"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key as React.Key} className="border p-2">
                    {"render" in col && col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key as string] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-3 text-sm">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className={`px-3 py-1 border rounded ${
            page === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages || 1}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className={`px-3 py-1 border rounded ${
            page === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-gray-50"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
