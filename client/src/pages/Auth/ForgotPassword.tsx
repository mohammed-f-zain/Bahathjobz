import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/UI/Card";
import { Input } from "../../components/UI/Input";
import { Button } from "../../components/UI/Button";
import { Search, User, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useCustomToast } from "../../contexts/useCustomToast";
import api from "../../utils/api";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toastError, toastSuccess } = useCustomToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toastError("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setEmailSent(true);
      toastSuccess(response.data.message || "Reset link sent successfully!");
    } catch (error: any) {
      toastError(error.response?.data?.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setEmailSent(false);
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
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
        </div>

        <Card>
          {!emailSent ? (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Forgot Password?</h2>
                <p className="mt-2 text-gray-600">
                  No worries! Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to:
                <br />
                <span className="font-semibold text-gray-900">{email}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                The link will expire in 1 hour. If you don't see the email, check your spam folder.
              </p>
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResend}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Resend Email"}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

