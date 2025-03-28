import React from 'react';

const Login: React.FC = () => {
  const hostname = import.meta.env.VITE_HOSTNAME || 'localhost';
  const fortyTwoLoginUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${import.meta.env.VITE_CLIENT_UID_42}&redirect_uri=http%3A%2F%2F${hostname}%3A3000%2Fapi%2Fauth%2F42%2Fcallback&response_type=code`
  const apiUrl = `http://${hostname}:${import.meta.env.VITE_BACKEND_PORT}`;
  
  console.log('API URL:', apiUrl);

  // Redirect to the backend's OAuth login endpoint for 42 authentication
  const handleOAuthLogin = (): void => {
    console.log("Redirecting to OAuth login...");
    window.location.href = fortyTwoLoginUrl;
  };

  const loginTestAccount = (): void => {
    console.log("Redirecting to skip OAuth login and create test account...");
    window.location.href = `${apiUrl}/api/auth/testAccount`;
  };

  const loginTestAccount2 = (): void => {
    console.log("Redirecting to skip OAuth login and create test account...");
    window.location.href = `${apiUrl}/api/auth/testAccount2`;
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
