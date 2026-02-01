import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/UI/Card';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useCustomToast } from '../../contexts/useCustomToast';
import api from '../../utils/api';

export function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useCustomToast();

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toastError('New passwords do not match');
      return;
    }
    setLoading(true);

    try {
      await api.post('/auth/change-password', {
        oldPassword,
        newPassword,
      });
      toastSuccess('Password changed successfully');
      if (user?.role?.toLowerCase() === "super_admin") {
        navigate("/admin");
      } else if (user?.role?.toLowerCase() === "employer") {
        navigate("/employer");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toastError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card>
          <div className="text-center mb-6">
            <Lock className="h-12 w-12 mx-auto text-blue-600" />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">
              Change Password
            </h2>
            <p className="mt-2 text-gray-600">
              Update your password for {user?.email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Old Password"
              type={showOldPassword ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter your old password"
              required
              icon={
                showOldPassword ? (
                  <EyeOff
                    className="h-5 w-5 text-gray-400 cursor-pointer"
                    onClick={() => setShowOldPassword(false)}
                  />
                ) : (
                  <Eye
                    className="h-5 w-5 text-gray-400 cursor-pointer"
                    onClick={() => setShowOldPassword(true)}
                  />
                )
              }
            />

            <Input
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              required
              icon={
                showNewPassword ? (
                  <EyeOff
                    className="h-5 w-5 text-gray-400 cursor-pointer"
                    onClick={() => setShowNewPassword(false)}
                  />
                ) : (
                  <Eye
                    className="h-5 w-5 text-gray-400 cursor-pointer"
                    onClick={() => setShowNewPassword(true)}
                  />
                )
              }
            />

            <Input
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
              icon={
                showConfirmPassword ? (
                  <EyeOff
                    className="h-5 w-5 text-gray-400 cursor-pointer"
                    onClick={() => setShowConfirmPassword(false)}
                  />
                ) : (
                  <Eye
                    className="h-5 w-5 text-gray-400 cursor-pointer"
                    onClick={() => setShowConfirmPassword(true)}
                  />
                )
              }
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}