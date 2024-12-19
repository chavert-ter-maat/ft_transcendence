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
  displayName: string;
  avatar?: string; // Add avatar field to the User model
}

const UserPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [avatar, setAvatar] = useState<File | null>(null); // State to store avatar image

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

        setUser(response.data);
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

  const handleDisplayNameChange = async () => {
    if (!newDisplayName) {
      setError('Display name cannot be empty');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No auth token found');
        return;
      }

      await axios.put(
        'http://localhost:4000/api/auth/set-display-name',
        { displayName: newDisplayName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (user) {
        setUser({ ...user, displayName: newDisplayName });
      }
      setSuccessMessage('Display name updated successfully');
      setNewDisplayName('');
    } catch (err) {
      setError('Failed to update display name');
      console.error(err);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      // Simple file validation (optional)
      if (file.size > 5000000) { // Example: 5MB max size
        setError('File size exceeds 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      console.log('Selected file:', file);
      setAvatar(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatar) {
      setError('Please select an avatar image');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', avatar);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No auth token found');
        return;
      }

      const response = await axios.post(
        'http://localhost:4000/api/auth/upload-avatar',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update the user object with the new avatar URL
      if (response.data.avatar && user) {
        setUser({ ...user, avatar: response.data.avatar });
      }

      setSuccessMessage('Avatar updated successfully');
      setAvatar(null); // Clear the avatar after upload
    } catch (err) {
      setError('Failed to upload avatar');
      console.error(err);
    }
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
          <p><strong>Display Name:</strong> {user.displayName}</p>
          
          {/* Display avatar if exists */}
          {user.avatar ? (
            <img
              src={`http://localhost:4000/${user.avatar}`} // Assuming the backend serves the avatar image
              alt="Avatar"
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
            />
          ) : (
            <p>No avatar set</p>
          )}

          <div>
            <input
              type="text"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="Enter new display name"
            />
            <button onClick={handleDisplayNameChange}>Change Display Name</button>
          </div>

          <div>
            <input type="file" onChange={handleAvatarChange} />
            <button onClick={handleAvatarUpload}>Upload Avatar</button>
          </div>

          {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        </div>
      ) : (
        <p>No user data found</p>
      )}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default UserPage;
