import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      setError('Authentication failed. Please try again.');
      console.log('Authentication failed. Please try again.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (token) {
      localStorage.setItem('authToken', token);
      navigate('/userpage');
    } else {
      setError('No authentication token received');
      console.log('No authentication token received');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [navigate]);

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Authenticating...</h2>
      <p>Please wait while we complete your authentication.</p>
    </div>
  );
};

export default AuthCallback;
