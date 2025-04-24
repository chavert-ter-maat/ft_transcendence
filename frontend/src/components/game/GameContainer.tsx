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

  //should have been effect

  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>("singleplayer");
  const [gameId, setGameId] = useState("");
  const [queueStatus, setQueueStatus] = useState("inactive");
  const [invitePlayed, setInvitePlayed] = useState<boolean>(false);
  const { isConnected, socketId } = useSocketStatus(state.user.username);

  const handleGameStart = (
    selectedGameMode: GameMode,
    selectedGameId: string
  ) => {
    setGameMode(selectedGameMode);
    setGameId(selectedGameId);
    setGameStarted(selectedGameId !== "");
  };

  //if requestedUser set go to lobby with context
  return (
    <div className="app">
      <SocketStatus isConnected={isConnected} socketId={socketId} />
      {!gameStarted && !state.requestedUser && (
        <Lobby
          onGameStart={handleGameStart}
          queueStatus={queueStatus}
          setQueueStatus={setQueueStatus}
		  invitedOpponent={""}
		  invitePlayed={invitePlayed}
          setInvitePlayed={setInvitePlayed}
        />
      )}
	  {!gameStarted && state.requestedUser && (
        <Lobby
          onGameStart={handleGameStart}
          queueStatus={queueStatus}
          setQueueStatus={setQueueStatus}
		  invitedOpponent={state.requestedUser?.username}
		  invited={state.user.invited}
		  invitePlayed={invitePlayed}
          setInvitePlayed={setInvitePlayed}
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
