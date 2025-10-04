// src/routes/UserProtected.tsx
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../stores/authStore";

export default function UserProtected() {
  const { token, role } = useAuthStore();

  if (!token || role !== "user") {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
