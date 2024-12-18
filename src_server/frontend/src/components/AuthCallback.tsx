import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';

const urlParams = new URLSearchParams(window.location.search);

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      setError('Authentication failed. Please try again.');
      console.log('Authentication failed. Please try again.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    console.log("rerender: " + token);
    if (token) {
      localStorage.setItem('authToken', token);
      console.log('Authentication successful. Redirecting to user page...');
      console.log('localStorage.getItem(authToken):', localStorage.getItem('authToken'));
	//   navigate('/chat', {state: {username: "jzeeuw-v"} }); //username should change to login username
		// console.log(axios.get("/api/auth/unprotected_hoi"));
		// console.log(axios.get("/api/auth/hoi"));
		// console.log(axios.get("/api/auth/strategy_hoi"));
      navigate('/userpage');
		//   navigate('/chat', {state: {username: "jzeeuw-v"} }); //username should change to login username

    } else {
      setError('No authentication token received');
      console.log('No authentication token received blabla');
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
