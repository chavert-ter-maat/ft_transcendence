import React, { useState } from "react";
import "../App_game.css";
import { GameMode, LobbyProps } from "../types";
import { joinGame } from "../socket";

const CustomGameCreation: React.FC<LobbyProps> = ({
  onGameStart,
  setQueueStatus,
  onBack,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>("singleplayer");
  const [enablePowerups, setEnablePowerups] = useState<boolean>(false);

  const handleStartGame = () => {
    setQueueStatus("inactive");
    joinGame(selectedMode, { enablePowerups }, (gameId) => {
      onGameStart(selectedMode, gameId);
    });
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
        <div className="setting">
          <label>Power-ups:</label>
          <input
            type="checkbox"
            checked={enablePowerups}
            onChange={(e) => setEnablePowerups(e.target.checked)}
          />
        </div>
      </div>
      <div className="buttons">
        <button onClick={handleStartGame}>Start Game</button>
        <button onClick={onBack}>Go Back</button>
      </div>
    </div>
  );
};

export default CustomGameCreation;
