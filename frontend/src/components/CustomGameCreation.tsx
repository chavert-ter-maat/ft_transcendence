import React, { useState } from "react";
import "../App_game.css";
import { GameMode, LobbyProps } from "../types";
import { joinGame } from "../socket";

const CustomGameCreation: React.FC<LobbyProps> = ({
  onGameStart,
  setQueueStatus,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>("singleplayer");

  const handleStartGame = () => {
    setQueueStatus("inactive");
    joinGame(
      selectedMode,
      undefined,
      (gameId) => {
        onGameStart(selectedMode, gameId);
      }
    );
  };

  return (
    <div className="custom-game-creation">
      <h2 className="custom-game_title">Create Custom Game</h2>
      <div className="settings">
        <div className="setting">
          <label>Game Mode:</label>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value as GameMode)}
          >
            <option value="singleplayer">Singleplayer</option>
            <option value="localMultiplayer">Local Multiplayer</option>
          </select>
        </div>
      </div>
      <div className="buttons">
        <button onClick={handleStartGame}>
          Start Game
        </button>
        <button onClick={() => window.history.back()}>Back to Lobby</button>
      </div>
    </div>
  );
};

export default CustomGameCreation;
