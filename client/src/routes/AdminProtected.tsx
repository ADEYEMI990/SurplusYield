// client/src/routes/AdminProtected.tsx
import { Outlet, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { useEffect } from "react";

export default function AdminProtected() {
  const { token, role } = useAuthStore();
  const navigate = useNavigate();
  console.log("Protected check:", { token, role });

  useEffect(() => {
    if (role === null) return; // don’t decide yet
    if (!token || role !== "admin") {
      navigate("/auth/login-admin"); // redirect if not logged in or not admin
    } else {
      console.log("Auth store state:", useAuthStore.getState());
    }
  }, [token, role, navigate]);

  return <Outlet />;
}