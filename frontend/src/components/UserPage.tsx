import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  userId: number;
  username: string;
  email: string;
  oauthToken: string;
  oauthRefreshToken: string;
  provider: string;
}

const UserPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('No auth token found');
          return;
        }

        const response = await axios.get('http://localhost:4000/api/auth/userInfo', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Assuming the response is the user object directly
        setUser(response.data); // Ensure to set the whole response
      } catch (err) {
        setError('Failed to fetch user data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    console.log('Logging out...');
    navigate('/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to Your User Page</h1>
      {user ? (
        <div>
          <p><strong>User ID:</strong> {user.userId}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Provider:</strong> {user.provider}</p>
        </div>
      ) : (
        <p>No user data found</p>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default UserPage;
