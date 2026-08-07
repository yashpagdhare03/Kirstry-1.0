import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from './shared';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, hasStore, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <Skeleton height={250} />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!hasStore && location.pathname !== '/store-setup') {
    return <Navigate to="/store-setup" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
