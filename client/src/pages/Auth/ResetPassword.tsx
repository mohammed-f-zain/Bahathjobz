import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "../../components/UI/Card";
import { Input } from "../../components/UI/Input";
import { Button } from "../../components/UI/Button";
import { Search, User, Lock, CheckCircle, XCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useCustomToast } from "../../contexts/useCustomToast";
import api from "../../utils/api";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toastError, toastSuccess } = useCustomToast();

  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState<string>("");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    setToken(tokenFromUrl);

    if (!tokenFromUrl) {
      setVerifying(false);
      setTokenValid(false);
      setTokenError("No reset token provided. Please request a new password reset link.");
      return;
    }

    verifyToken(tokenFromUrl);
  }, [searchParams]);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await api.get(`/auth/verify-reset-token?token=${tokenToVerify}`);
      if (response.data.valid) {
        setTokenValid(true);
        setEmail(response.data.email || "");
      } else {
        setTokenValid(false);
        setTokenError(response.data.message || "Invalid token");
      }
    } catch (error: any) {
      setTokenValid(false);
      setTokenError(error.response?.data?.message || "Invalid or expired reset link");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toastError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      toastError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toastError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      
      setResetSuccess(true);
      toastSuccess(response.data.message || "Password reset successfully!");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
    } catch (error: any) {
      toastError(error.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state while verifying token
  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <Card>
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900">Verifying Reset Link...</h2>
              <p className="text-gray-600 mt-2">Please wait while we verify your reset link.</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (tokenValid === false) {
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
          </div>

          <Card>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
              <p className="text-gray-600 mb-6">{tokenError}</p>
              <div className="space-y-3">
                <Link to="/auth/forgot-password">
                  <Button className="w-full">Request New Reset Link</Button>
                </Link>
                <Link to="/auth/login">
                  <Button variant="outline" className="w-full mt-3">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Success state
  if (resetSuccess) {
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
          </div>

          <Card>
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your password has been changed successfully. You will be redirected to the login page shortly.
              </p>
              <Link to="/auth/login">
                <Button className="w-full">Go to Login</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Reset password form
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
        </div>

        <Card>
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Password</h2>
            {email && (
              <p className="mt-2 text-gray-600">
                For: <span className="font-semibold">{email}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                label="New Password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <p className="text-red-500 text-sm">Passwords do not match</p>
            )}

            {newPassword && newPassword.length < 6 && (
              <p className="text-amber-500 text-sm">Password must be at least 6 characters</p>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

