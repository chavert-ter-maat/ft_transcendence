import React, { useState } from "react";
import "./GameContainer.css";
import Lobby from "./Lobby";
import Game from "./Game";
import { GameMode } from "../../types";
import SocketStatus from "../socketStatus";
import { useSocketStatus } from "../../hooks/useSocketStatus";
import { useLocation } from "react-router-dom";
import { User } from "../../global.interface";

const GameContainer: React.FC = () => {
  const state = useLocation().state as { user: User; requestedUser: User };

  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("singleplayer");
  const [gameId, setGameId] = useState("");
  const [queueStatus, setQueueStatus] = useState("inactive");
  const { isConnected, socketId } = useSocketStatus();

  const handleGameStart = (
    selectedGameMode: GameMode,
    selectedGameId: string
  ) => {
    setGameMode(selectedGameMode);
    setGameId(selectedGameId);
    setGameStarted(selectedGameId !== "");
  };

  return (
    <div className="app">
      <SocketStatus isConnected={isConnected} socketId={socketId} />
      {!gameStarted && (
        <Lobby
          onGameStart={handleGameStart}
          queueStatus={queueStatus}
          setQueueStatus={setQueueStatus}
        />
      )}
      {gameStarted && (
        <Game
          userId={state.user.username}
          gameMode={gameMode}
          gameId={gameId}
          setQueueStatus={setQueueStatus}
          onGameStart={handleGameStart}
        />
      )}
    </div>
  );
};

export default GameContainer;
