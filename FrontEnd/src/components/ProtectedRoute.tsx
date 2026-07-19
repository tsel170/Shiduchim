import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PageSkeleton } from './common/PageSkeleton';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Cached session: render the app immediately so navigation stays usable
  // while auth refresh / page data load in the background.
  if (isAuthenticated) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="protected-route-skeleton">
        <PageSkeleton variant="form" rows={4} />
      </div>
    );
  }

  return <Navigate to="/login" replace state={{ from: location.pathname }} />;
};
