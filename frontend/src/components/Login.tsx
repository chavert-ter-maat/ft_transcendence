import React, { useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [User, setUser] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  // Redirect to the backend's OAuth login endpoint for 42 authentication
  const handleOAuthLogin = (): void => {
    console.log("Redirecting to OAuth login...");
    // Redirect the user to the backend's OAuth login route
    // window.location.href = 'https://api.intra.42.fr/oauth/authorize';
    window.location.href = 'http://localhost:5001/auth/42';
  };

  // Handle traditional login using username and password
  const handleLogin = async (): Promise<void> => {
    try {
      const response = await axios.post('/users/login', { username: User, password });
      alert(response.data.message);
      navigate('/');
    } catch (error: any) {
      alert(error.response?.data.message || 'Login failed');
    }
  };

  // Navigate to the registration page
  const handleSignUp = (): void => {
    navigate('/register');
  };

  return (
    <div className="registration-container">
      <h1>Login</h1>
      
      {/* OAuth Login Button */}
      <button onClick={handleOAuthLogin}>Login with 42 OAuth</button>
      
      {/* Username and Password Fields */}
      <input
        type="text"
        placeholder="Username"
        value={User}
        onChange={(e) => setUser(e.target.value)}
      />
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      {/* Traditional Login Button */}
      <button onClick={handleLogin}>Login</button>

      {/* Sign Up Option */}
      <p>Or</p>
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
};

export default Login;
