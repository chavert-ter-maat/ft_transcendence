import React from 'react';
import { Navigate } from 'react-router-dom';

interface SemiProtectedRouteProps {
  children: React.ReactElement;
}

const SemiProtectedRoute: React.FC<SemiProtectedRouteProps> = ({ children }) => {
  const sessionId = localStorage.getItem('sessionId');

  if (!sessionId) {
    console.log('No sessionId found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default SemiProtectedRoute;
