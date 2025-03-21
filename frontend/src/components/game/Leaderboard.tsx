import React, { useEffect, useState } from 'react';
import axios from '../../axios';

interface LeaderboardEntry {
  playerId: string;
  wins: number;
  losses: number;
  totalGames: number;
  totalScore: number;
  winRate: string;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get<LeaderboardEntry[]>('/api/game/leaderboard');
        if (Array.isArray(response.data)) {
          setLeaderboard(response.data);
        } else {
          throw new Error('Invalid leaderboard data received');
        }
      } catch (err) {
        setError('Failed to load leaderboard data');
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
              <td>{entry.playerId}</td>
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
