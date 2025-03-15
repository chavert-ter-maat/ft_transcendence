import React from 'react';
import { Navigate } from 'react-router-dom';

interface SemiProtectedRouteProps {
  children: React.ReactElement;
}

const SemiProtectedRoute: React.FC<SemiProtectedRouteProps> = ({ children }) => {
  const userId = localStorage.getItem('authToken');
  const secretKey = localStorage.getItem('authToken');

  if (!(userId && secretKey)) {
    console.log('No secretKey or UserID found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default SemiProtectedRoute;
