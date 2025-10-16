// src/components/pages/ChangePassword.tsx
import ChangePassword from "../../components/user/ChangePassword";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-2xl">
        <div className="flex items-center mb-6">
          <button
            title="Go Back"
            onClick={() => navigate("/user/dashboard")}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 ml-3">
            Security Settings
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            Update Your Password
          </h2>

          <ChangePassword
            // onSuccess={() => navigate("/user/dashboard")}
          />
        </div>
      </div>

      <footer className="mt-10 text-xs text-gray-400 text-center">
        &copy; {new Date().getFullYear()} Surplus Yield. All Rights Reserved.
      </footer>
    </div>
  );
}
