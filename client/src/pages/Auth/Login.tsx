import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Card } from "../../components/UI/Card";
import { Input } from "../../components/UI/Input";
import { Button } from "../../components/UI/Button";
import { Search, User } from "lucide-react";
import { useCustomToast } from "../../contexts/useCustomToast";
import api from "../../utils/api";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toastError } = useCustomToast();

  // Check if the user is already authenticated via Google on page load (in case they were redirected back)
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token"); // Token from query

  if (token) {
    loginWithGoogleToken(token);
  }
}, []);

 const loginWithGoogleToken = async (token: string) => {
  try {
    setLoading(true);
    localStorage.setItem("token", token); // store token
    const { data } = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (data.role?.toLowerCase() === "super_admin") navigate("/admin");
    else if (data.role?.toLowerCase() === "employer") navigate("/employer");
    else navigate("/dashboard");
  } catch (error: any) {
    toastError(error.response?.data?.message || "Google login failed");
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.role?.toLowerCase() === "super_admin") navigate("/admin");
      else if (user.role?.toLowerCase() === "employer") navigate("/employer");
      else navigate("/dashboard");
    } catch (error: any) {
      toastError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth route
    window.location.href = "/api/auth/google"; // Assuming your backend handles the OAuth
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="flex items-center justify-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="h-10 w-10 text-blue-600" />
                <User className="h-5 w-5 text-blue-600 absolute -top-1 -right-1" />
              </div>
              <div>
                <span className="text-3xl font-bold text-blue-600">BAHATH</span>
                <span className="text-3xl font-bold text-blue-800 ml-1">JOBZ</span>
              </div>
            </div>
          </Link>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/auth/register"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign up here
              </Link>
            </p>

            {/* Google Login Button */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              Sign in with Google
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
