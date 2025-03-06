import React, { useState } from 'react';
import axios from '../axios'; // Ensure axios is configured correctly
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {

  const fortyTwoLoginUrl = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-a5bd312a93c816bff99a2b38516ad438f718452a8e8a1935968b23c7517f509b&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fapi%2Fauth%2F42%2Fcallback&response_type=code`;

  // Redirect to the backend's OAuth login endpoint for 42 authentication
  const handleOAuthLogin = (): void => {
    console.log("Redirecting to OAuth login...");
    window.location.href = fortyTwoLoginUrl;
  };

  const loginTestAccount = (): void => {
    console.log("Redirecting to skip OAuth login and create test account...");
	window.location.href = `http://localhost:4000/api/auth/testAccount`;
    // window.location.href = fortyTwoLoginUrl;
  };

  const loginTestAccount2 = (): void => {
    console.log("Redirecting to skip OAuth login and create test account...");
	window.location.href = `http://localhost:4000/api/auth/testAccount2`;
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
