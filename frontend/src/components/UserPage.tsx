import React, { useEffect, useState } from 'react';

const UserPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Fetch user data after authentication
    const fetchUserData = async () => {
      try {
        const response = await fetch('/user'); // Make sure this endpoint exists in your backend
        if (response.ok) {
          const userData = await response.json(); // Expecting JSON response
          setUser(userData); // Store the user profile or any relevant data
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div>
      {user ? (
        <div>
          <h1>User Profile</h1>
          <pre>{JSON.stringify(user, null, 2)}</pre> {/* Display user data in a readable format */}
        </div>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default UserPage;
