// src/components/AuthComponents

import axios from 'axios';
import React, { CSSProperties, useEffect, useState } from 'react';

// Load environment variables
const CLIENT_ID = process.env.REACT_APP_FORTYTWO_CLIENT_ID!;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI!;

const AuthComponent = (): JSX.Element => {
  const [error, setError] = useState<string>(''); // Error message state
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');

    if (error) {
      setError('Authentication failed: ' + error);
      return;
    }

    if (code) {
      handleAuthCode(code, state); // Ensure this is called within the component scope
    }
  }, []);

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

    window.location.href = authUrl;
  };

  const handleAuthCode = async (code: string, returnedState: string | null) => {
    setIsLoading(true);
    const savedState = localStorage.getItem('oauth_state');
  
    if (returnedState !== savedState) {
      setError('Invalid state parameter. Authentication failed.');
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await axios.post<{ access_token: string }>('http://localhost:3000/auth/callback', { code });
  
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        window.location.href = '/dashboard';
      } else {
        setError('Authentication failed: No access token received.');
      }
    } catch (err: any) {
      setError('Failed to complete authentication');
    } finally {
      setIsLoading(false);
      localStorage.removeItem('oauth_state');
    }
  };

  const spinnerStyle: CSSProperties = {
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    animation: 'spin 2s linear infinite',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Welcome to Multiplayer Pong</h2>
          <p style={{ color: '#6b7280' }}>Connect with 42 to challenge your friends in real-time matches</p>
        </div>

        {error && (
          <div style={{ marginBottom: '16px', padding: '12px', background: '#ffe4e4', borderRadius: '4px', color: '#b91c1c' }} aria-live="assertive">
            <strong>Error:</strong> {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          aria-disabled={isLoading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {isLoading ? (
            <div className="spinner" style={spinnerStyle}></div>
          ) : (
            'Login with 42'
          )}
        </button>
      </div>
    </div>
  );
};

export default AuthComponent;
