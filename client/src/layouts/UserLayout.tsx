// src/layouts/UserLayout.tsx
import { Outlet } from "react-router-dom";

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar + dashboard structure lives in UserDashboard */}
        <Outlet />
    </div>
  );
}
