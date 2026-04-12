import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'reception' | 'laboratory' | 'admin' | 'doctor';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    // Redirect to appropriate page based on user role (admin can access all)
    switch (user?.role) {
      case 'reception':
        return <Navigate to="/reception" replace />;
      case 'laboratory':
        // Check if user is lab technician
        if (user.email === 'technician@clinic.com') {
          return <Navigate to="/technician" replace />;
        }
        return <Navigate to="/laboratory-reception" replace />;
      case 'doctor':
        return <Navigate to="/doctor" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};
