import React, { useState } from "react";
import "./CustomGameCreation.css";
import {
  CustomGameModes,
  CustomGameCreationProps,
} from "../types/customGame.types";

const CustomGameCreation: React.FC<CustomGameCreationProps> = ({
  onGameStart,
  setQueueStatus,
}) => {
  const [gameSettings, setGameSettings] = useState({
    gameMode: CustomGameModes,
  });
  // const [selectedMode, setSelectedMode] = useState<CustomGameModes | null>(
  //   null
  // );

  const handleModeSelect = (mode: CustomGameModes) => {
    setSelectedMode(mode);
  };

  const handleStartGame = () => {
    if (!selectedMode) return;

    const gameMode =
      selectedMode === "local-multiplayer" ? "localMultiplayer" : selectedMode;
    setQueueStatus("inactive");
    onGameStart(gameMode, "");
  };

  return (
    <div className="custom-game-creation">
      <h2 className="custom-game_title">Create Custom Game</h2>
      <div className="settings">
        <div className="setting">
          <label>Paddle Size:</label>
          <select
            value={selectedMode || ""}
            onChange={(e) => setSelectedMode(e.target.value as CustomGameModes)}
          >
            <option value="singleplayer">Singleplayer</option>
            <option value="local multiplayer">Local Multiplayer</option>
          </select>
        </div>
      </div>
      <div className="buttons">
        <button onClick={handleStartGame}>Start Game</button>
        <button onClick={onBack}>Back to Lobby</button>
      </div>
    </div>
  );
};

export default CustomGameCreation;
