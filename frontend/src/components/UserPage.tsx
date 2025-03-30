import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User } from "../global.interface";
import PopUpModal from '../components/PopUpModal/PopUpModal';
import './UserPage.css'; // Import external CSS

const UserPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modal, setModal] = useState({ show: false, content: "", isError: false });
  const [newDisplayName, setNewDisplayName] = useState<string>('');
  const [avatar, setAvatar] = useState<File | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setModal({ show: true, content: "No auth token found", isError: true });
          return;
        }

        const response = await axios.get('http://localhost:3000/api/auth/userInfo', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (err) {
        setModal({ show: true, content: `Failed to fetch user data: ${err}`, isError: true });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [loading]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handleDisplayNameChange = async () => {
    if (!newDisplayName) {
      setModal({ show: true, content: "Display name cannot be empty", isError: true });
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setModal({ show: true, content: "No authToken found", isError: true });
        return;
      }

      await axios.post(
        'http://localhost:3000/api/auth/set-display-name',
        { displayName: newDisplayName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setModal({ show: true, content: "Display name updated successfully", isError: false });
      setNewDisplayName('');
      setLoading(true);
    } catch (err) {
      setModal({ show: true, content: err.response.data.message || "Error updating display name", isError: true });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file) {
      if (file.size > maxSize) {
        setModal({ show: true, content: "File exceeds the maximum size of 5MB", isError: true });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setModal({ show: true, content: "File must be an image", isError: true });
        return;
      }
      setAvatar(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatar) {
      setModal({ show: true, content: "No avatar selected", isError: true });
      return;
    }

    const formData = new FormData();
    formData.append('avatar', avatar);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setModal({ show: true, content: "No authToken found", isError: true });
        return;
      }

      const response = await axios.post(
        'http://localhost:3000/api/auth/upload-avatar',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.avatar && user) {
        setUser({ ...user, avatar: response.data.avatar });
      }

      setModal({ show: true, content: "Avatar updated successfully", isError: false });
      setAvatar(null);
      setLoading(true);
    } catch (err) {
      setModal({ show: true, content: `Failed to upload avatar: ${err}`, isError: true });
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="user-container">
      <h1 className="user-title">Welcome to Your User Page</h1>
      {user && (
        <div className="user-info">
          <div className="avatar-section">
            {user.imageName ? (
              <img src={"data:image/png;base64, " + user.imageString} alt={user.imageName} className="avatar" />
            ) : (
              <p>No avatar set</p>
            )}
          </div>

          <div className="info-details">
            <p><strong>User ID:</strong> {user.userId}</p>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Provider:</strong> {user.provider}</p>
            <p><strong>Display Name:</strong> {user.displayName}</p>
            <p><strong>Image Name:</strong> {user.imageName}</p>
          </div>

          <div className="input-section">
            <input type="text" value={newDisplayName} onChange={(e) => setNewDisplayName(e.target.value)} placeholder="Enter display name" />
            <button onClick={handleDisplayNameChange}>Change Display Name</button>
          </div>

          <div className="input-section">
            <input type="file" accept="image/png" onChange={handleAvatarChange} />
            <button onClick={handleAvatarUpload}>Upload Avatar</button>
          </div>

          {modal.show && <PopUpModal modal={modal} setModal={setModal} />}
        </div>
      )}

      <div className="button-group">
        <button onClick={handleLogout}>Logout</button>
        <button onClick={() => navigate('/chat', { state: { user } })}>Go to Chats</button>
        <button onClick={() => navigate('/game', { state: { user, requestedUser: null } })}>Go to Game</button>
        <button onClick={() => navigate('/2fa-dashboard', { state: { user } })}>2fa settings</button>
      </div>
    </div>
  );
};

export default UserPage;
