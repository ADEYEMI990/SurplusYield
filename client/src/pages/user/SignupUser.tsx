// src/pages/user/SignupUser.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../lib/api";
import useAuthStore from "../../stores/authStore";
import axios from "axios";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

import Card, {
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

export default function SignupUser() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState("");
  

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Please enter both first and last name ❌");
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    setLoading(true);
    try {
      const { data } = await API.post("/auth/register", {
        name: fullName,
        email,
        password,
        referralCode,
      });
      setAuth({ user: data.user, token: data.token, role: "user" });
      toast.success("Signup successful 🎉");
      navigate("/user/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || "Signup failed ❌");
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Signup failed ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  bg-gray-100 px-4 sm:px-6 py-8">
      <Card className="w-full max-w-md shadow-lg rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-lg sm:text-xl font-bold">
            Signup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {/* First + Last Name flex row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                label="First Name"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full"
              />
              <Input
                type="text"
                label="Last Name"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <Input
              type="email"
              label="Email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />

            {/* Password with toggle */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Confirm Password with toggle */}
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Input
              type="text"
              label="Referral Code (optional)"
              placeholder="Enter referral code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="w-full"
            />

            <Button type="submit" className="w-full" loading={loading}>
              Sign Up
            </Button>
          </form>

          {/* 👇 Beneath signup form */}
          <div className="text-center mt-6 text-sm">
            <p className="mb-2">
              Already a Member?{" "}
              <Link to="/auth/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
            <Link to="/auth/login">
              <Button
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
              >
                Go to Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}