import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User } from "../global.interface";

const UserPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [avatar, setAvatar] = useState<File | null>(null); // State to store avatar image

  const hostname = import.meta.env.VITE_HOST_NAME || 'localhost';
  const apiUrl = `http://${hostname}:${import.meta.env.VITE_BACKEND_PORT}`;
  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('No auth token found');
          return;
        }

        const response = await axios.get(`${apiUrl}/api/auth/userInfo`, { //magic value
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
  }, [loading]);

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

      await axios.post(
        `${apiUrl}/api/auth/set-display-name`, //magic value 
        { displayName: newDisplayName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

    //   if (user) {
    //     setUser({ ...user, displayName: newDisplayName });
    //   }
      setSuccessMessage('Display name updated successfully');
      setNewDisplayName('');
	  setLoading(true);
    } catch (err) {
      setError('Failed to update display name');
      console.error(err);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      // Simple file validation (optional)
      if (file.size > 500000) { // Example: 5MB max size
        setError('File size exceeds 0.5MB');
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
	  console.log("BEFORE:" + avatar);
      const response = await axios.post(
        `${apiUrl}/api/auth/upload-avatar`, //magic value
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
	  setLoading(true);
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

	const handlegototchats = () => {
		if (user)
			navigate('/chat', {state: {user: user} });
	};
	const handlegototgame = () => {
		if (user)
			navigate('/game', {state: {user: user, requestedUser: null} });
	};

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
		  <p><strong>Image Name:</strong> {user.imageName}</p>
          
          {/* Display avatar if exists */}
          {user.imageName ? (
            <img
				src={"data:image/png;base64, " + user.imageString} // Assuming the backend serves the avatar image, don't like this
              alt={user.imageName}
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
            <input type="file" accept="image/png" onChange={handleAvatarChange} />
            <button onClick={handleAvatarUpload}>Upload Avatar</button>
          </div>

          {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        </div>
      ) : (
        <p>No user data found</p>
      )}

      <button onClick={handleLogout}>Logout</button>
	  <button onClick={handlegototchats}>Go to chats.</button>
	  <button onClick={handlegototgame}>Go to game.</button>
    </div>
  );
};

export default UserPage;
