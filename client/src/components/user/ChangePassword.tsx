// src/components/user/ChangePassword.tsx
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../lib/api";
import { AxiosError } from "axios";

interface ChangePasswordProps {
  onSuccess?: () => void;
}

interface ErrorResponse {
  message?: string;
}

// ✅ Move PasswordField OUTSIDE the parent component
function PasswordField({
  label,
  value,
  onChange,
  show,
  toggleShow,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  toggleShow: () => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePassword({ onSuccess }: ChangePasswordProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
      toast.error(
        "Password must include uppercase, lowercase, number, and special character"
      );
      return false;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await API.put("/auth/change-password", {
        oldPassword,
        newPassword,
      });
      toast.success("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onSuccess?.();
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-200 shadow-md rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-2 mb-3">
        <Lock className="text-blue-600" size={20} />
        <h2 className="text-lg font-semibold text-gray-800">
          Change Your Password
        </h2>
      </div>

      <PasswordField
        label="Old Password"
        value={oldPassword}
        onChange={setOldPassword}
        show={showOld}
        toggleShow={() => setShowOld((p) => !p)}
        placeholder="Enter your current password"
      />

      <PasswordField
        label="New Password"
        value={newPassword}
        onChange={setNewPassword}
        show={showNew}
        toggleShow={() => setShowNew((p) => !p)}
        placeholder="Enter new password"
      />

      <PasswordField
        label="Confirm New Password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        show={showConfirm}
        toggleShow={() => setShowConfirm((p) => !p)}
        placeholder="Re-enter new password"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full py-2 rounded-lg font-medium text-white transition ${
          loading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Updating..." : "Update Password"}
      </button>

      <p className="text-xs text-gray-500 text-center mt-2">
        Ensure your password is strong and unique.
      </p>
    </div>
  );
}