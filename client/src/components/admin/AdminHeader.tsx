// src/components/admin/AdminHeader.tsx
import { useState } from "react";
import { Menu } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import Dialog from "../common/Dialog";

interface AdminHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function AdminHeader({ setSidebarOpen }: AdminHeaderProps) {
  const logout = useAuthStore((state) => state.logout);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirmLogout = () => {
    logout();
    window.location.href = "/auth/login-admin"; // redirect to login page
  };

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
        <button
          className="px-3 py-1.5 bg-blue-900 text-white rounded-md text-sm"
          onClick={() => setIsModalOpen(true)}
        >
          Logout
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm Logout"
        maxWidth="sm"
      >
        <p className="mb-6 text-gray-700">Are you sure you want to log out?</p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
            onClick={handleConfirmLogout}
          >
            Logout
          </button>
        </div>
      </Dialog>
    </header>
  );
}
