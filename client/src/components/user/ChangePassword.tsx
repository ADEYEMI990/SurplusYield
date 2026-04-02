// src/components/user/ChangePassword.tsx
import { useState } from "react";
import { Eye, EyeOff, Lock, Shield, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import API from "../../lib/api";
import { AxiosError } from "axios";

interface ChangePasswordProps {
  onSuccess?: () => void;
}

interface ErrorResponse {
  message?: string;
}

// Password Strength Indicator
function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const strengthText = ["Weak", "Fair", "Good", "Strong", "Very Strong"][Math.floor(strength / 1.5)] || "Weak";
  const strengthColor = 
    strength <= 2 ? "bg-red-500" : 
    strength <= 3 ? "bg-yellow-500" : 
    "bg-green-500";

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all ${
              i <= strength ? strengthColor : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-1">Strength: {strengthText}</p>
    </div>
  );
}

// Password Requirements List
function PasswordRequirements({ password }: { password: string }) {
  const requirements = [
    { label: "At least 8 characters", test: password.length >= 8 },
    { label: "Contains uppercase letter", test: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", test: /[a-z]/.test(password) },
    { label: "Contains a number", test: /[0-9]/.test(password) },
    { label: "Contains special character (@$!%*?&)", test: /[@$!%*?&]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      {requirements.map((req, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          {req.test ? (
            <CheckCircle className="w-3 h-3 text-green-500" />
          ) : (
            <XCircle className="w-3 h-3 text-gray-300" />
          )}
          <span className={req.test ? "text-gray-600" : "text-gray-400"}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// Password Field Component
function PasswordField({
  label,
  value,
  onChange,
  show,
  toggleShow,
  placeholder,
  showStrength = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  toggleShow: () => void;
  placeholder: string;
  showStrength?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors text-gray-900"
        />
        <button
          type="button"
          onClick={toggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {showStrength && value && (
        <>
          <PasswordStrength password={value} />
          <PasswordRequirements password={value} />
        </>
      )}
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => window.location.href = "/user/dashboard"}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
          </div>
          <p className="text-gray-500 text-sm ml-11">Update your password to keep your account secure</p>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-green-50 to-white rounded-2xl p-5 mb-6 border border-green-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Password Security Tips</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use at least 8 characters</li>
                <li>• Include uppercase and lowercase letters</li>
                <li>• Add numbers and special characters</li>
                <li>• Avoid using common words or personal information</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-600" />
              <h2 className="font-bold text-gray-900">Change Your Password</h2>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <PasswordField
              label="Current Password"
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
              showStrength={true}
            />

            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              toggleShow={() => setShowConfirm((p) => !p)}
              placeholder="Re-enter new password"
            />

            {/* Password Match Indicator */}
            {confirmPassword && newPassword && (
              <div className="flex items-center gap-2 text-sm">
                {newPassword === confirmPassword ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600">Passwords match</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-600">Passwords do not match</span>
                  </>
                )}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold text-white transition-colors ${
                loading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                "Update Password"
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              We recommend changing your password every 3-6 months for better security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}