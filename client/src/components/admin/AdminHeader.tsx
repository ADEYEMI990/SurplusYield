// src/components/admin/AdminHeader.tsx
import { Menu } from "lucide-react";

interface AdminHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}
export default function AdminHeader({ setSidebarOpen }: AdminHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 md:left-64 flex items-center justify-between px-4 md:px-6 py-4 bg-blue-700 text-white shadow-md z-20">
      {/* Hamburger for mobile */}
      <button
        className="md:hidden p-2 rounded-md hover:bg-blue-600"
        onClick={() => setSidebarOpen(true)}
        title="Open sidebar"
        aria-label="Open sidebar"
      >
        <Menu className="w-6 h-6" />
      </button>

      <h2 className="text-xl font-semibold">Admin Dashboard</h2>

      <div className="flex items-center gap-4">
        <button className="px-3 py-1.5 bg-blue-900 text-white rounded-md text-sm">
          Logout
        </button>
      </div>
    </header>
  );
}