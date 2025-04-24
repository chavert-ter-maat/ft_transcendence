import React, { useState, useEffect } from "react";
import { GameMode, LobbyProps } from "../../types";
import CustomGameCreation from "./CustomGameCreation";
import { useNavigate } from "react-router-dom";
import {
  getSocket,
  joinGame,
  onCountdown,
  offCountdown,
  onMatchFound,
  offMatchFound,
  onQueueStatus,
  offQueueStatus,
} from "../../socket";

//enter here set setShowCustomSetup to true and invited something to true
const Lobby: React.FC<LobbyProps> = ({
  onGameStart,
  queueStatus,
  setQueueStatus,
  invitedOpponent,
  invited,
}) => {
	let start_mode: string = "single player";
	let customize:	boolean = false;
	if (invitedOpponent != "")
	{
		start_mode = "invitedMultiplayer";
		customize = false;
	}
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState<GameMode>(start_mode);
  const [showCustomSetup, setShowCustomSetup] = useState(customize);

  useEffect(() => {
    const handleCountdown = (data: { gameId: string; waitTime: number }) => {
      setCountdown(data.waitTime);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev && prev > 1) {
            return prev - 1;
          } else {
            clearInterval(interval);
            setCountdown(null);
            return null;
          }
        });
      }, 1000);
    };

    const handleMatchFound = (data: { gameId: string }) => {
      onGameStart("remoteMultiplayer" as GameMode, data.gameId);
    };

    const handleQueueStatus = (data: { status: string }) => {
      setQueueStatus(data.status);
    };

    onCountdown(handleCountdown);
    onMatchFound(handleMatchFound);
    onQueueStatus(handleQueueStatus);

    return () => {
      offCountdown();
      offMatchFound();
      offQueueStatus();
    };
  }, [onGameStart, setQueueStatus]);

  const handleJoinQueue = (gameMode: GameMode) => {
    const socket = getSocket();
    if (!socket || !socket.id) {
      console.log("socket error");
      return;
    }
    setSelectedMode(gameMode);
    if (gameMode === "remoteMultiplayer") {
      setQueueStatus("joining");
      socket.emit("joinQueue", { playerId: socket.id });
    } else if (invitedOpponent) {
		setSelectedMode("invitedMultiplayer");
		setQueueStatus("joining");
    	socket.emit("joinGame", { playerId: socket.id, invitedOpponent: invitedOpponent });
	} else {
      joinGame(gameMode, undefined, (gameId) => {
        onGameStart(gameMode, gameId);
      });
    }
  };

  const handleInvitedQueue = (gameMode: GameMode) => {
    const socket = getSocket();
    if (!socket || !socket.id) {
      console.log("socket error");
      return;
    }
    // setSelectedMode(gameMode);
	// setSelectedMode("invitedMultiplayer");
	// setQueueStatus("joining");
	socket.emit("joinGame", { playerId: socket.id, invitedOpponent: invitedOpponent });
  };

  const handleLeaveQueue = () => {
    const socket = getSocket();
    if (socket && socket.id) {
      setQueueStatus("leaving");
      socket.emit("leaveQueue", { playerId: socket.id });
    }
    setQueueStatus("inactive");
    setSelectedMode("singleplayer");
  };

  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate('/userpage');
  };

  console.log(selectedMode , queueStatus);
  if (selectedMode === "invitedMultiplayer" && (queueStatus === "inactive" || queueStatus === "idle") && invited){
	// setShowCustomSetup(false)
	handleInvitedQueue("invitedMultiplayer" as GameMode);
  }

  return (
    <div>
      {showCustomSetup ? (
        <CustomGameCreation
          onGameStart={onGameStart}
          setQueueStatus={setQueueStatus}
          queueStatus={queueStatus}
          onBack={() => setShowCustomSetup(false)}
        />
      ) : (
        <>
          {queueStatus === "inactive" &&
            selectedMode !== "remoteMultiplayer" && (
              <>
                <h2>Select Game Mode</h2>
                <button onClick={() => setShowCustomSetup(true)}>
                  Custom Game
                </button>
                <button onClick={() => setSelectedMode("remoteMultiplayer")}>
                  Remote Multiplayer
                </button>
              </>
            )}
        </>
      )}

      {selectedMode === "remoteMultiplayer" && (
        <div className="queue-controls">
          {queueStatus === "inactive" && (
            <>
              <h2>Remote Multiplayer</h2>
              <button
                onClick={() => handleJoinQueue("remoteMultiplayer" as GameMode)}
                disabled={queueStatus !== "inactive" && queueStatus !== "idle"}
              >
                Join Queue
              </button>
              <button
                onClick={() => {
                  setSelectedMode("singleplayer");
                  setQueueStatus("inactive");
                }}
              >
                Leave
              </button>
            </>
          )}
          {queueStatus === "inQueue" && countdown === null && (
            <button onClick={handleLeaveQueue}>Leave Queue</button>
          )}
          {queueStatus && <p>Status: {queueStatus}</p>}
        </div>
      )}

	  {selectedMode === "invitedMultiplayer" && (
        <div> {/*className="queue-controls">*/}
            <>
              <h2>Invited Multiplayer</h2>
			  {/* <button
                onClick={() => handleJoinQueue("invitedMultiplayer" as GameMode)}
                disabled={queueStatus !== "inactive" && queueStatus !== "idle"}
              >
                Join Queue
              </button> */}
              <button
                onClick={() => {
                  setSelectedMode("singleplayer");
                  setQueueStatus("inactive");
                }}
              >
                Leave
              </button>
            </>
        </div>
      )}
	  
      {countdown !== null && <p>Game starts in: {countdown}</p>}
      {!showCustomSetup && <button onClick={handleGoBack}>Go Back</button>}
    </div>
  );
};
 
export default Lobby;
