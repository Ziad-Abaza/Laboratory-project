import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Lazy loaded pages
const LoginPage = React.lazy(() => import('@/pages/auth/login'));
const ReceptionPage = React.lazy(() => import('@/pages/reception/ReceptionPage'));
const LaboratoryReceptionPage = React.lazy(() => import('@/pages/laboratory/LaboratoryReceptionPage'));
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));

// Loading component
const LoadingSpinner = () => (
  <div className="size-full flex items-center justify-center">
    <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Protected Routes */}
              <Route 
                path="/reception" 
                element={
                  <ProtectedRoute requiredRole="reception">
                    <ReceptionPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/laboratory-reception" 
                element={
                  <ProtectedRoute requiredRole="laboratory">
                    <LaboratoryReceptionPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};
