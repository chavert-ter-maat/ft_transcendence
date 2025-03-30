import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PopUpModal from './PopUpModal/PopUpModal';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [modal, setModal] = useState({ show: false, content: "", isError: false });
  const navigate = useNavigate();

  const token = localStorage.getItem('authToken');
  const urlParams = new URLSearchParams(window.location.search);
  const currentPath = window.location.pathname;
  const sessionId = urlParams.get('sessionId');

  const redirectWithMessage = (message: string, path: string) => {
    setModal({ show: true, content: message, isError: true });
    setTimeout(() => navigate(path, { replace: true }), 3000);
  };

  useEffect(() => {
    if (!token && currentPath !== '/auth/verify-2fa') {
      redirectWithMessage("You are not logged in. Redirecting to the login page...", "/login");
    }
  }, []);

  if (!token && currentPath !== '/auth/verify-2fa') {
    return <PopUpModal modal={modal} setModal={setModal} />;
  }

  return children;
};

export default ProtectedRoute;
