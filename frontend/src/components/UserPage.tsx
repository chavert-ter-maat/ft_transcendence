import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User } from "../global.interface";
import PopUpModal from '../components/PopUpModal/PopUpModal'

const UserPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modal, setModal] = useState({ show: false, content: "", isError: false })
  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [avatar, setAvatar] = useState<File | null>(null); // State to store avatar image

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setModal({ show: true, content: "No auth token found", isError: true })
          return;
        }

        const response = await axios.get('http://localhost:3000/api/auth/userInfo', { //magic value
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (err) {
        setModal({ show: true, content: `Failed to fetch user data: ${err}`, isError: true })
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
      setModal({ show: true, content: "Display name cannot be empty", isError: true })
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setModal({ show: true, content: "No authToken found", isError: true })
        return;
      }

      await axios.post(
        'http://localhost:3000/api/auth/set-display-name', //magic value 
        { displayName: newDisplayName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setModal({ show: true, content: "Display name updated successfully", isError: false })
      setNewDisplayName('');
      setLoading(true);
    } catch (err) {
      setModal({ show: true, content: err.response.data.message || "Generic display name error", isError: true })
      console.error(err);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    const allowedSize = 5 * 1024 * 1024
    if (file) {
      // Simple file validation (optional)
      if (file.size > allowedSize) { // Example: 5MB max size
        setModal({ show: true, content: "File exceeds the maximum size of 5MB", isError: true })
        return;
      }
      if (!file.type.startsWith('image/')) {
        setModal({ show: true, content: "File must be of type image", isError: true })
        return;
      }
      console.log('Selected file:', file);
      setAvatar(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatar) {
      setModal({ show: true, content: "No avatar has been selected", isError: true })
      return;
    }

    const formData = new FormData();
    formData.append('avatar', avatar);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setModal({ show: true, content: "No authToken found", isError: true })
        return;
      }
      console.log("BEFORE:" + avatar);
      const response = await axios.post(
        'http://localhost:3000/api/auth/upload-avatar', //magic value
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

      setModal({ show: true, content: "Avatar updated successfully", isError: false })
      setAvatar(null); // Clear the avatar after upload
      setLoading(true);
    } catch (err) {
      setModal({ show: true, content: `Failed to upload avatar due to: ${err}`, isError: true })
      console.error(err);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const handlegototchats = () => {
    if (user)
      navigate('/chat', { state: { user: user } });
  };
  const handlegototgame = () => {
    if (user)
      navigate('/game', { state: { user: user, requestedUser: null } });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to Your User Page</h1>
      {user && (
        <div>
          <p><strong>User ID:</strong> {user.userId}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Provider:</strong> {user.provider}</p>
          <p><strong>Display Name:</strong> {user.displayName}</p>
          <p><strong>Image Name:</strong> {user.imageName}</p>

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
              placeholder="Enter display name"
            />
            <button onClick={handleDisplayNameChange}>Change Display Name</button>
          </div>

          <div>
            <input type="file" accept="image/png" onChange={handleAvatarChange} />
            <button onClick={handleAvatarUpload}>Upload Avatar</button>
          </div>
          {modal.show && <PopUpModal modal={modal} setModal={setModal} />}
        </div>
      )}

      <button onClick={handleLogout}>Logout</button>
      <button onClick={handlegototchats}>Go to chats.</button>
      <button onClick={handlegototgame}>Go to game.</button>

    </div>
  );
};

export default UserPage;
