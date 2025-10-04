// src/layouts/UserLayout.tsx
import { Outlet } from "react-router-dom";
import UserDashboard from "../components/user/UserDashboard";

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar + dashboard structure lives in UserDashboard */}
      <UserDashboard>
        <Outlet />
      </UserDashboard>
    </div>
  );
}
