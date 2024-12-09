// src/components/Login

import React, { useState } from 'react';

const CLIENT_ID = process.env.REACT_APP_FORTYTWO_CLIENT_ID!;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI!;

const Login = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateState = (): string => {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  };

  const handleLogin = () => {
    setIsLoading(true);
    const state = generateState();
    localStorage.setItem('oauth_state', state);

    const authUrl = `https://api.intra.42.fr/oauth/authorize?` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=public&` +
      `state=${state}`;

    window.location.href = authUrl;  // Redirect to the OAuth provider
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
        <h2>Login with 42</h2>
        <button onClick={handleLogin} disabled={isLoading} style={{ padding: '10px 20px', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
          {isLoading ? 'Logging in...' : 'Login with 42'}
        </button>
      </div>
    </div>
  );
};

export default Login;
