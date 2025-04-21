import React, { useEffect, useState } from "react";
import axios from "../../axios";
import { useParams } from "react-router-dom";
import {
  MatchHistoryEntry,
  MatchHistoryResponse,
} from "../../types/matchHistory.types";

const MatchHistory: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [matches, setMatches] = useState<MatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMatchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<MatchHistoryResponse>(
          `/api/game/match-history/${username}`
        );

        if (!response.data || !Array.isArray(response.data.matches)) {
          console.error("Invalid data structure received:", response.data);
          throw new Error("Invalid match history data received from server.");
        }

        setMatches(response.data.matches);
      } catch (err: any) {
        console.error("Failed to load match history:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load match history data. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatchHistory();
  }, [username]);

  if (loading) return <div className="loading">Loading match history...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (matches.length === 0)
    return <div className="no-matches">No match history found.</div>;

  return (
    <div className="match-history-container">
      <h2>Match History</h2>
      <table className="match-history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Opponent</th>
            <th>Your Score</th>
            <th>Opponent Score</th>
            <th>Result</th>
            <th>Mode</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((entry) => (
            <tr key={entry.gameId}>
              <td>
                {new Date(entry.startTime).toLocaleDateString()}
                <br />({new Date(entry.startTime).toLocaleTimeString()})
              </td>
              <td>{entry.opponentUsername}</td>
              <td>{entry.userScore}</td>
              <td>{entry.opponentScore}</td>
              <td className={`result-${entry.result}`}>{entry.result}</td>
              <td>{entry.gameMode}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MatchHistory;
