import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PopUpModal from './PopUpModal/PopUpModal';
import SocketStatus from './socketStatus';
import { useSocketStatus } from '../hooks/useSocketStatus';
import './Login.css';
import { parse } from 'dotenv';

const Login: React.FC = () => {
  const { isConnected, socketId } = useSocketStatus(); 
  const [modal, setModal] = useState({ show: false, content: "", isError: false });
  const hostname = import.meta.env.VITE_HOSTNAME || 'localhost';
  const fortyTwoLoginUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${import.meta.env.VITE_CLIENT_UID_42}&redirect_uri=http%3A%2F%2F${hostname}%3A3000%2Fapi%2Fauth%2F42%2Fcallback&response_type=code`
  const apiUrl = `http://${hostname}:${import.meta.env.VITE_BACKEND_PORT}`;

  useEffect(() => {
    const parseAuthError = async () => {
      const queryString = window.location.search
      const urlParams = new URLSearchParams(queryString);
      const authError = urlParams.get("auth_error")
      if (authError) {
        setModal({ show: true, content: authError, isError: true });
      }
    }
    parseAuthError()
  }, []);

  console.log('API URL:', apiUrl);

  const handleOAuthLogin = () => {
    console.log("Redirecting to OAuth login...");
    window.location.href = fortyTwoLoginUrl;
  };

//   const loginTestAccount = () => {
//     console.log("Redirecting to skip OAuth login and create test account...");
//     window.location.href = `${apiUrl}/api/auth/testAccount`;
//   };

//   const loginTestAccount2 = () => {
//     console.log("Redirecting to skip OAuth login and create test account...");
//     window.location.href = `${apiUrl}/api/auth/testAccount2`;
//   }


  return (
    <div className="login-container">
      <SocketStatus isConnected={isConnected} socketId={socketId} />
      <h1 className="login-title">Login</h1>

      <div className="button-container">
        <button className="login-button oauth" onClick={handleOAuthLogin}>Login with 42 OAuth</button>
        {/* <button className="login-button test-account" onClick={loginTestAccount}>Login with Test Account</button>
        <button className="login-button test-account" onClick={loginTestAccount2}>Login with Test Account 2</button> */}
      </div>

      {modal.show && <PopUpModal modal={modal} setModal={setModal} />}
    </div>
  );
};

export default Login;
