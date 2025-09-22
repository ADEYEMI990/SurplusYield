// src/components/admin/AdminHeader.tsx
export default function AdminHeader() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
      <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      <div className="flex items-center gap-4">
        <button className="px-3 py-1.5 bg-gray-800 text-white rounded-md text-sm">
          Logout
        </button>
      </div>
    </header>
  );
}