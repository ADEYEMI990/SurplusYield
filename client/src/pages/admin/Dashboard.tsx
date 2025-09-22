// src/pages/admin/Dashboard.tsx
export default function Dashboard() {
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="bg-blue-700 text-white p-4 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      </div>

      {/* Page content container */}
      <div className="bg-blue-600 text-white p-6 rounded-lg shadow-md">
        <p>Welcome to your dashboard! Here’s an overview of your system.</p>
      </div>
    </div>
  );
}