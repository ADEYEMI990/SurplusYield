// src/pages/user/LoginUser.tsx
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

export default function LoginUser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", { email, password });
      setAuth({ user: data.user, token: data.token, role: "user" });
      console.log("LOGIN RESPONSE DATA:", data);
      toast.success("Login successful ✅");
      navigate("/user/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message ?? "Login failed ❌");
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Login failed ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg shadow-md rounded-xl">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-semibold text-gray-800">
            User Login
          </CardTitle>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Please sign in to continue.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              label="Email"
            />

            {/* Password with toggle */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-8 sm:top-9 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              loading={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Links */}
          <div className="text-center mt-6 text-sm space-y-2">
            <p>
              Not a Member?{" "}
              <Link
                to="/auth/register"
                className="font-medium text-blue-600 hover:underline"
              >
                SIGN UP
              </Link>
            </p>
            <Link to="/auth/register">
              <Button
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto px-6"
              >
                Go to Signup
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}