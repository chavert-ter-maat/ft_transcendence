import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { MatchHistoryEntry } from "../../types/matchHistory.types";

interface MatchHistoryProps {
  username: string;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ username }) => {
  const [match_history, setMatchhistory] = useState<MatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setError("Username not provided.");
      setLoading(false);
      return;
    }

    const fetchMatchhistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<MatchHistoryEntry[]>(
          `/api/game/matchHistory/${username}`,
        );

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid match history data received");
        }

        setMatchhistory(response.data);
      } catch (err) {
        setError("Failed to load match history data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchhistory();
  }, [username]);

  if (loading) return <div>Loading match history...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="match-history">
      <h2>Match History</h2>
      <table>
        <thead>
          <tr>
            <th>Match Date:</th>
            <th>Player 1:</th>
            <th>Score:</th>
            <th>Player 2:</th>
            <th>Score:</th>
            <th>Winner:</th>
          </tr>
        </thead>
        <tbody>
          {match_history.map((entry, index) => (
            <tr key={index}>
              <td>{entry.player1Username}</td>
              <td>{entry.player1Score}</td>
              <td>{entry.player2Username}</td>
              <td>{entry.player2Score}</td>
              <td>{entry.winnerUsername}</td>
              <td>
                {new Date(entry.matchDate).toLocaleDateString()} {new Date(entry.matchDate).toLocaleTimeString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MatchHistory;
