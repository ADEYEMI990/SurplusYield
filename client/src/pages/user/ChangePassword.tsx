// src/pages/user/ChangePassword.tsx

import ChangePassword from "../../components/user/ChangePassword";
import { useNavigate } from "react-router-dom";

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  return <ChangePassword onSuccess={() => navigate("/user/dashboard")} />;
}