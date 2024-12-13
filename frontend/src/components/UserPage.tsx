import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const UserPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    if (token) {
      // If token exists, log in the user
      localStorage.setItem('token', token); // Store token in local storage

      // Redirect to the user page after successful login
      navigate('/userpage');
    } else {
      // If no token, redirect to login page
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div>
      <h1>User Page</h1>
      {/* Display user details */}
    </div>
  );
};

export default UserPage;
