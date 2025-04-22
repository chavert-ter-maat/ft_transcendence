import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User } from "../global.interface";
import SocketStatus from "./socketStatus";
import { useSocketStatus } from "../hooks/useSocketStatus";
import PopUpModal from "../components/PopUpModal/PopUpModal";
import "./UserPage.css";

const UserPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [modal, setModal] = useState({ show: false, content: "", isError: false });
  const { isConnected, socketId } = useSocketStatus(user?.username);
  const hostname = import.meta.env.VITE_HOSTNAME || "localhost";
  const apiUrl = `http://${hostname}:${import.meta.env.VITE_BACKEND_PORT}`;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token found");
        const response = await axios.get(`${apiUrl}/api/auth/userInfo`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err: any) {
        setModal({ show: true, content: `Failed to fetch user data: ${err.message}`, isError: true });
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [loading]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const handleDisplayNameChange = async () => {
    if (!newDisplayName) return setModal({ show: true, content: "Display name cannot be empty", isError: true });
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authToken found");
      await axios.post(`${apiUrl}/api/auth/set-display-name`, { displayName: newDisplayName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModal({ show: true, content: "Display name updated successfully", isError: false });
      setNewDisplayName('');
      setLoading(true);
    } catch (err: any) {
      setModal({ show: true, content: err.response?.data?.message || "Error updating display name", isError: true });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const maxSize = 5 * 1024 * 1024;
    if (!file) return;
    if (file.size > maxSize) return setModal({ show: true, content: "File exceeds 5MB", isError: true });
    if (!file.type.startsWith("image/")) return setModal({ show: true, content: "File must be an image", isError: true });
    setAvatar(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatar) return setModal({ show: true, content: "No avatar selected", isError: true });
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authToken found");
      const formData = new FormData();
      formData.append("avatar", avatar);
      const response = await axios.post(`${apiUrl}/api/auth/upload-avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.avatar && user) {
        setUser({ ...user, avatar: response.data.avatar });
      }
      setModal({ show: true, content: "Avatar updated successfully", isError: false });
      setAvatar(null);
      setLoading(true);
    } catch (err: any) {
      setModal({ show: true, content: `Failed to upload avatar: ${err.message}`, isError: true });
    }
  };

  if (loading) return <div className="loader">Loading...</div>;

  const handleGoToMatchHistory = () => {
    if (user) {
      navigate(`/matchHistory/${user.username}`, { state: { user: user } });
    }
  };

  return (
    <div className="user-page">
      <SocketStatus isConnected={isConnected} socketId={socketId} />
      <div className="card">
        <h1>Welcome, {user?.displayName || user?.username}</h1>
        <div className="user-profile">
          <div className="avatar-preview">
            {user?.imageName ? (
              <img src={`data:image/png;base64,${user.imageString}`} alt="Avatar" />
            ) : (
              <div className="no-avatar">No Avatar</div>
            )}
          </div>
          <div className="user-details">
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Provider:</strong> {user?.provider}</p>
            <p><strong>User ID:</strong> {user?.userId}</p>
          </div>
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="New Display Name"
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
          />
          <button onClick={handleDisplayNameChange}>Update Display Name</button>
        </div>

        <div className="form-group">
          <input type="file" accept="image/png" onChange={handleAvatarChange} />
          <button onClick={handleAvatarUpload}>Upload Avatar</button>
        </div>

        <div className="actions">
          <button onClick={() => navigate("/chat", { state: { user } })}>Go to Chats</button>
          <button onClick={() => navigate("/game", { state: { user, requestedUser: null } })}>Play Game</button>
          <button onClick={() => navigate("/leaderboard", { state: { user } })}>Leaderboard</button>
          <button onClick={() => navigate("/2fa-dashboard", { state: { user } })}>2FA Dashboard</button>
          <button onClick={handleGoToMatchHistory}>Match History</button>
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {modal.show && <PopUpModal modal={modal} setModal={setModal} />}
    </div>
  );
};

export default UserPage;
