import React from "react";

interface ScoreboardProps {
  player1Score: number;
  player2Score: number;
  player1Name: string;
  player2Name: string;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  player1Score,
  player2Score,
  player1Name,
  player2Name,
}) => {
  return (
    <div className="scoreboard">
      <div className="score-item">
        <span className="player-name">{player1Name}:</span>
        <span className="score">{player1Score}</span>
      </div>
      <div className="score-item">
        <span className="player-name">{player2Name}:</span>
        <span className="score">{player2Score}</span>
      </div>
    </div>
  );
};

export default Scoreboard;
