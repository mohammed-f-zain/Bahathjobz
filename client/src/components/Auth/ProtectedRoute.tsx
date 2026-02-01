// src/components/Auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute: no user, redirecting to login");
    return <Navigate to="/auth/login" replace />;
  }

  const userRole = user.role?.toLowerCase();
  console.log("ProtectedRoute: user role =", userRole, "allowed roles =", roles);

  if (roles && !roles.map(r => r.toLowerCase()).includes(userRole)) {
    console.log("ProtectedRoute: role not allowed, redirecting to unauthorized");
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
