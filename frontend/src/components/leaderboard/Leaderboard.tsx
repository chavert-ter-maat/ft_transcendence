import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { LeaderboardEntry } from "../../types/leaderboard.types";

interface UserInfo {
  userId: number;
  username: string;
  displayName?: string;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        
        // Fetch leaderboard data
        const response = await axios.get<LeaderboardEntry[]>(
          "/api/game/leaderboard"
        );
        
        if (!Array.isArray(response.data)) {
          throw new Error("Invalid leaderboard data received");
        }
        
        setLeaderboard(response.data);
        
        // Create a map of playerIds to usernames
        const playerIdToUsername: Record<string, string> = {};
        
        // For each player ID, fetch user info to get the username
        const userRequests = response.data.map(async (entry) => {
          try {
            // Skip special player types like 'Bot' or 'Local Challenger'
            if (entry.playerId === 'Bot' || entry.playerId === 'Local Challenger') {
              playerIdToUsername[entry.playerId] = entry.playerId;
              return;
            }
            
            // Attempt to fetch user by ID - this assumes playerId is the username
            // If not, this API structure might need adjustment
            const userResponse = await axios.post<UserInfo>(
              "/api/auth/userInfoSomeoneElse",
              { requestedUser: entry.playerId }
            );
            
            if (userResponse.data) {
              // Use display name if available, otherwise username
              playerIdToUsername[entry.playerId] = 
                userResponse.data.displayName || 
                userResponse.data.username || 
                entry.playerId;
            }
          } catch (err) {
            console.error(`Failed to fetch user info for player ID ${entry.playerId}:`, err);
            // If we can't get user info, fall back to the player ID
            playerIdToUsername[entry.playerId] = entry.playerId;
          }
        });
        
        // Wait for all user info requests to complete
        await Promise.all(userRequests);
        
        // Update state with the player ID to username mapping
        setUserMap(playerIdToUsername);
      } catch (err) {
        setError("Failed to load leaderboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);

  if (loading) return <div>Loading leaderboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Games</th>
            <th>Win Rate</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={entry.playerId}>
              <td>{index + 1}</td>
              <td>{userMap[entry.playerId] || entry.playerId}</td>
              <td>{entry.wins}</td>
              <td>{entry.losses}</td>
              <td>{entry.totalGames}</td>
              <td>{entry.winRate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
