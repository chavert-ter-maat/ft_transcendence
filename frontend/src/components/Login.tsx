import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PopUpModal from './PopUpModal/PopUpModal';
import './Login.css'; // Import the external CSS file

const Login: React.FC = () => {
  const [modal, setModal] = useState({ show: false, content: "", isError: false });
  const navigate = useNavigate();
  const fortyTwoLoginUrl = import.meta.env.VITE_REDIRECT_URI_42;

  const handleOAuthLogin = () => {
    console.log("Redirecting to OAuth login...");
    window.location.href = fortyTwoLoginUrl;
  };

  const loginTestAccount = () => {
    console.log("Redirecting to skip OAuth login and create test account...");
    window.location.href = `http://localhost:3000/api/auth/testAccount`;
  };

  const loginTestAccount2 = () => {
    console.log("Redirecting to skip OAuth login and create test account...");
    window.location.href = `http://localhost:3000/api/auth/testAccount2`;
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setModal({ show: true, content: "You are already logged in. Redirecting to the user page...", isError: false });
      setTimeout(() => {
        navigate('/userpage');
      }, 3000);
    }
  }, []);

  return (
    <div className="login-container">
      <h1 className="login-title">Login</h1>

      <div className="button-container">
        <button className="login-button oauth" onClick={handleOAuthLogin}>Login with 42 OAuth</button>
        <button className="login-button test-account" onClick={loginTestAccount}>Login with Test Account</button>
        <button className="login-button test-account" onClick={loginTestAccount2}>Login with Test Account 2</button>
      </div>

      {modal.show && <PopUpModal modal={modal} setModal={setModal} />}
    </div>
  );
};

export default Login;
