import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AccountRole } from '../types/account';

interface RoleRouteProps {
  allowed: AccountRole[];
  children: React.ReactNode;
  fallback?: string;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  allowed,
  children,
  fallback = '/browse',
}) => {
  const { currentUser } = useAuth();

  if (!currentUser || !allowed.includes(currentUser.role)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};
