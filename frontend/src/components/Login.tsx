// components/Login.tsx
import React, { useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleOAuthLogin = (): void => {
    console.log("OAuth 2.0 login would happen here.");
  };

  const handleLogin = async (): Promise<void> => {
    try {
      const response = await axios.post('/users/login', { username: email, password });
      alert(response.data.message);
      navigate('/');
    } catch (error: any) {
      alert(error.response?.data.message || 'Login failed');
    }
  };

  const handleSignUp = (): void => {
    navigate('/register');
  };

  return (
    <div className="registration-container">
      <h1>Login</h1>
      <button onClick={handleOAuthLogin}>Login with OAuth 2.0</button>
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <p>Or</p>
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
};

export default Login;
