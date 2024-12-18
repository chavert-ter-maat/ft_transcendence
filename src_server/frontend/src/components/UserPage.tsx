import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import { GoToChatOverview } from '../chat/MessageView';

const UserPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    console.log('Logging out...');
    navigate('/login');
  };

  const handlegototchats = () => {
    navigate('/chat', {state: {username: "jzeeuw-v"} });
  };

//   navigate('/chat', {state: {username: "jzeeuw-v"} });
	// console.log(axios.get("/api/messages"));
	//this works now after altering the validate function, looks like it though.
	// it does not 
	console.log(axios.get("/api/auth/unprotected_hoi"));
	console.log(axios.get("/api/auth/hoi"));
	console.log(axios.get("/api/auth/strategy_hoi"));

  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to Your User Page</h1>
      <p>You are successfully authenticated!</p>
      <button onClick={handleLogout}>Logout.</button>
	  <button onClick={handlegototchats}>Got to chats.</button>
    </div>
  );
};

export default UserPage;
