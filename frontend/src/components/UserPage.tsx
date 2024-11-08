import React, { useEffect, useState } from 'react';

const UserPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Fetch user data after authentication
    const fetchUserData = async () => {
      try {
        const response = await fetch('/user');
        if (response.ok) {
          const userData = await response.text();
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
        <div dangerouslySetInnerHTML={{ __html: user }} />
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default UserPage;
