import React, { useState } from 'react';
import axios from '../axios'; // Ensure axios is configured correctly
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {

  const fortyTwoLoginUrl = import.meta.env.VITE_REDIRECT_URI_42;
  console.log(fortyTwoLoginUrl);

  // Redirect to the backend's OAuth login endpoint for 42 authentication
  const handleOAuthLogin = (): void => {
    console.log("Redirecting to OAuth login...");
    window.location.href = fortyTwoLoginUrl;
  };

  const loginTestAccount = (): void => {
    console.log("Redirecting to skip OAuth login and create test account...");
	window.location.href = `http://localhost:3000/api/auth/testAccount`;
    // window.location.href = fortyTwoLoginUrl;
  };

  const loginTestAccount2 = (): void => {
    console.log("Redirecting to skip OAuth login and create test account...");
	window.location.href = `http://localhost:3000/api/auth/testAccount2`;
    // window.location.href = fortyTwoLoginUrl;
  };


  return (
    <div className="registration-container">
      <h1>Login</h1>
      
      {/* OAuth Login Button */}
      <button onClick={handleOAuthLogin}>Login with 42 OAuth</button>
	  <button onClick={loginTestAccount}>Login with test account</button>
	  <button onClick={loginTestAccount2}>Login with test account 2</button>
      
    </div>
  );
};

export default Login;
