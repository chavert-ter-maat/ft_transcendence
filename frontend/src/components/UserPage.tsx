import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    console.log('Logging out...');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to Your User Page</h1>
      <p>You are successfully authenticated!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default UserPage;
