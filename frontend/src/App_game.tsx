import React, { useState } from "react";
import "./App_game.css";
import Lobby from "./components/Lobby";
import Game from "./components/Game";
import { GameMode } from "./types";
import SocketStatus from "./components/socketStatus";
import { useSocketStatus } from "./hooks/useSocketStatus";
import { useLocation } from "react-router-dom";
import { User } from "./global.interface";

const App_game: React.FC = () => {
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

  // console.log("App_game", state.user.username);
  // @mhaan requested player here.
  // console.log("Invited player", state.requestedUser?.username);
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

export default App_game;
