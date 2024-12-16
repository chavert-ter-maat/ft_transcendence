import React, { useEffect, useState } from 'react';

const UserPage: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve the token from localStorage
    const storedToken = localStorage.getItem('authToken');
    setToken(storedToken);
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to the User Page!</h1>
      {token ? (
        <p>Your token: <code>{token}</code></p>
      ) : (
        <p>No token found. Please ensure you are logged in.</p>
      )}
    </div>
  );
};

export default UserPage;
