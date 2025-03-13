import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  getSocket,
  movePaddle,
  onGameStateUpdate,
  offGameStateUpdate,
  requestRematch,
} from "../socket";
import Scoreboard from "./Scoreboard";
import { GameState, CoordinateCache, GameProps } from "../types";

const Game: React.FC<GameProps> = ({
  userId,
  gameMode,
  gameId: initialGameId,
  setQueueStatus,
  onGameStart,
}) => {
  const [gameId, setGameId] = useState<string>(initialGameId);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [rematchRequested, setRematchRequested] = useState(false);
  const [rematchError, setRematchError] = useState<string | null>(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const keyRef = useRef<{ [key: string]: boolean }>({});
  const lastMoveTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  // Initialize canvas context
  useEffect(() => {
    if (canvasRef.current) {
      contextRef.current = canvasRef.current.getContext("2d");
      // Initial clear is done in renderGame, no need here
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "w", "s"].includes(e.key)) {
      e.preventDefault();
    }
    keyRef.current[e.key] = true;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keyRef.current[e.key] = false;
  }, []);

  const processPaddleMovement = useCallback(() => {
    const currentTime = Date.now();
    const moveInterval = 16;

    if (currentTime - lastMoveTimeRef.current >= moveInterval) {
      if (gameMode === "localMultiplayer") {
        const p1Up = keyRef.current["w"];
        const p1Down = keyRef.current["s"];
        const p2Up = keyRef.current["ArrowUp"];
        const p2Down = keyRef.current["ArrowDown"];

        if (p1Up && !p1Down) {
          movePaddle(gameId, "up", 1);
        } else if (p1Down && !p1Up) {
          movePaddle(gameId, "down", 1);
        }

        if (p2Up && !p2Down) {
          movePaddle(gameId, "up", 2);
        } else if (p2Down && !p2Up) {
          movePaddle(gameId, "down", 2);
        }
      } else {
        const up = keyRef.current["ArrowUp"];
        const down = keyRef.current["ArrowDown"];
        if (up && !down) {
          movePaddle(gameId, "up");
        } else if (down && !up) {
          movePaddle(gameId, "down");
        }
      }

      lastMoveTimeRef.current = currentTime;
    }
  }, [gameId, gameMode]);

  const calculateCoordinates = useCallback(
    (
      entity: {
        x: number;
        y: number;
        width: number;
        height: number;
        radius?: number;
      },
      canvas: HTMLCanvasElement
    ): CoordinateCache => {
      return {
        x: entity.x * canvas.width * 0.01,
        y: entity.y * canvas.height * 0.01,
        width: entity.width * canvas.width * 0.01,
        height: entity.height * canvas.height * 0.01,
        ...(entity.radius && { radius: entity.radius * canvas.width * 0.01 }),
      };
    },
    []
  );

  const coordinates = useMemo(() => {
    if (!canvasRef.current || !gameState) return null;
    const canvas = canvasRef.current;

    const powerUps = gameState.powerUps
      ? gameState.powerUps.map((powerUp) => ({
          x: powerUp.x * canvas.width * 0.01,
          y: powerUp.y * canvas.height * 0.01,
          width: powerUp.width * canvas.width * 0.01,
          height: powerUp.width * canvas.width * 0.01,
        }))
      : [];

    return {
      player1: calculateCoordinates(
        gameState.player1.paddle,
        canvas
      ),
      player2: calculateCoordinates(
        gameState.player2.paddle,
        canvas
      ),
      ball: calculateCoordinates(
        {
          ...gameState.ball,
          height: gameState.ball.radius * 2,
          width: gameState.ball.radius * 2,
        },
        canvas
      ),
      powerUps,
    };
  }, [gameState, calculateCoordinates]);

  const drawPaddle = useCallback(
    (context: CanvasRenderingContext2D, coords: CoordinateCache) => {
      context.fillStyle = "#FFF";
      context.fillRect(coords.x, coords.y, coords.width, coords.height);
    },
    []
  );

  const drawBall = useCallback(
    (context: CanvasRenderingContext2D, coords: CoordinateCache) => {
      context.beginPath();
      context.arc(coords.x, coords.y, coords.radius!, 0, Math.PI * 2);
      context.fillStyle = "#FFF";
      context.fill();
    },
    []
  );

  const drawPowerup = useCallback(
    (context: CanvasRenderingContext2D, coords: CoordinateCache) => {
      context.fillStyle = "#0F0";
      context.fillRect(coords.x, coords.y, coords.width, coords.height);
    },
    []
  );

  const renderGame = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context || !coordinates || !gameState) return;

    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (coordinates.powerUps?.length > 0) {
      coordinates.powerUps.forEach((powerUp) => {
        drawPowerup(context, powerUp);
      });
    }

    drawPaddle(context, coordinates.player1);
    drawPaddle(context, coordinates.player2);
    drawBall(context, coordinates.ball);
  }, [coordinates, gameState, drawPaddle, drawBall, drawPowerup]);

  const setupAnimationLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    const animate = () => {
      processPaddleMovement();
      renderGame();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [processPaddleMovement, renderGame]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on(
      "gameOver",
      (data: { winner: string; rematchTimeout: number }) => {
        setWinner(data.winner);
        setTimeLeft(Math.ceil((data.rematchTimeout - Date.now()) / 1000));
      }
    );

    socket.on("playerDisconnected", () => {
      setOpponentDisconnected(true);
    });

    return () => {
      socket.off("gameOver");
      socket.off("playerDisconnected");
    };
  }, []);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const handleLeaveGame = useCallback(() => {
    const socket = getSocket();
    if (socket) {
      socket.emit("leaveGame", { gameId });
    }
    setQueueStatus("inactive");
    onGameStart("singleplayer", "");
  }, [gameId, setQueueStatus, onGameStart]);

  const handleRematchClick = () => {
    setRematchRequested(true);
    setRematchError(null);
    requestRematch(gameId, (errorMessage) => {
      setRematchRequested(false);
      setRematchError(errorMessage);
    });
  };

  const handleServerRematch = useCallback(
    (rematchGameId: string) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      offGameStateUpdate();

      setGameId(rematchGameId);
      setWinner(null);
      setRematchRequested(false);
      setTimeLeft(null);
      setGameState(null);
      setOpponentDisconnected(false);

      const socket = getSocket();
      if (socket) {
        socket.emit("getGameState", { gameId: rematchGameId });
      }

      onGameStateUpdate(setGameState);
    },
    []
  );

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("rematchStarted", handleServerRematch);
    
    return () => {
      socket.off("rematchStarted");
    };
  }, [handleServerRematch]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    onGameStateUpdate(setGameState);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      offGameStateUpdate();
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (!gameState) return;
    return setupAnimationLoop();
  }, [gameState, setupAnimationLoop]);

  if (winner || opponentDisconnected) {
    return (
      <div className="game-over">
        {winner ? (
          <>
            <h2>Game Over!</h2>
            <p>{winner === "player1" ? "Player 1" : "Player 2"} wins!</p>
          </>
        ) : (
          <>
            <h2>Opponent Disconnected</h2>
            <p>Your opponent has left the game.</p>
          </>
        )}
        <div className="game-over-buttons">
          {!opponentDisconnected &&
            gameMode !== "remoteMultiplayer" &&
            timeLeft !== null &&
            timeLeft > 0 && (
              <>
                <button
                  onClick={handleRematchClick}
                  disabled={rematchRequested}
                >
                  {rematchRequested
                    ? "Rematch Requested"
                    : `Rematch (${timeLeft}s)`}
                </button>
                {rematchError && (
                  <p className="error-message">{rematchError}</p>
                )}
              </>
            )}
          <button onClick={handleLeaveGame}>Leave Game</button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <Scoreboard
        player1Score={gameState?.player1.score || 0}
        player2Score={gameState?.player2.score || 0}
        player1Id={userId}
        player2Id={
          gameMode === "singleplayer" && !gameState?.player2.id
            ? "Bot"
            : gameState?.player2.id || ""
        }
      />
      <canvas ref={canvasRef} width={800} height={600} />
    </div>
  );
};

export default Game;
