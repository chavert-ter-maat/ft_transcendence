import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Save the token in localStorage
      localStorage.setItem('authToken', token);

      // Redirect to the user page
      navigate('/userpage');
    } else {
      console.error('Token not found in query parameters');
    }
  }, [navigate]);

  return <div>Authenticating...</div>;
};

export default AuthCallback;
