import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'customer' | 'agent' | 'admin';
  anyAgentOrAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, anyAgentOrAdmin }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  // Wait until AuthContext finishes checking the Cognito session before deciding route access.
  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-700">Loading...</div>;
  }

  // Unauthenticated users are sent to login, with the original route kept in navigation state.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Agent/Admin screens require role data derived from Cognito groups and backend user state.
  if (anyAgentOrAdmin) {
    if (role !== 'agent' && role !== 'admin') {
      return <Navigate to="/" replace />;
    }
  } else if (requiredRole && role !== requiredRole && role !== 'admin') { // admin can access anything a requiredRole can, usually
    // Wait, let's keep it strict if required:
    if (requiredRole === 'admin' && role !== 'admin') {
      return <Navigate to="/" replace />;
    }
    if (requiredRole === 'agent' && role !== 'agent' && role !== 'admin') {
       return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
