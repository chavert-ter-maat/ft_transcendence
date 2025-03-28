import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  getSocket,
  movePaddle,
  onGameStateUpdate,
  offGameStateUpdate,
  requestRematch,
} from "../../socket";
import Scoreboard from "./Scoreboard";
import { GameState, CoordinateCache, GameProps } from "../../types";

const INTERPOLATION_DELAY = 100;
const FRAME_RATE = 60;
const FRAME_TIME = 1000 / FRAME_RATE;
const SERVER_TICKRATE = 1000 / 30; // Match backend tick rate (30 ticks per second)

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
  const [previousGameState, setPreviousGameState] = useState<GameState | null>(
    null
  );

  const lastFrameTimeRef = useRef<number>(performance.now());
  const lastStateTimeRef = useRef<number>(performance.now());

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const keyRef = useRef<{ [key: string]: boolean }>({});
  const lastMoveTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (canvasRef.current) {
      contextRef.current = canvasRef.current.getContext("2d");
    }
  }, [gameId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("gameState", (newGameState: GameState) => {
      setPreviousGameState(gameState);
      setGameState(newGameState);
      lastStateTimeRef.current = performance.now();
    });
  }, [gameState]);

  const interpolateState = useCallback(
    (
      prevState: GameState | null,
      nextState: GameState | null,
      factor: number
    ): GameState | null => {
      if (!prevState || !nextState) return nextState;

      const ballPositionDelta = Math.abs(nextState.ball.x - prevState.ball.x);
      const isBallReset = ballPositionDelta > 50;

      return {
        ...nextState,
        ball: isBallReset
          ? nextState.ball
          : {
              ...nextState.ball,
              x:
                prevState.ball.x +
                (nextState.ball.x - prevState.ball.x) * factor,
              y:
                prevState.ball.y +
                (nextState.ball.y - prevState.ball.y) * factor,
            },
        player1: {
          ...nextState.player1,
          paddle: {
            ...nextState.player1.paddle,
            y:
              prevState.player1.paddle.y +
              (nextState.player1.paddle.y - prevState.player1.paddle.y) *
                factor,
          },
        },
        player2: {
          ...nextState.player2,
          paddle: {
            ...nextState.player2.paddle,
            y:
              prevState.player2.paddle.y +
              (nextState.player2.paddle.y - prevState.player2.paddle.y) *
                factor,
          },
        },
      };
    },
    []
  );

  const predictState = useCallback(
    (state: GameState, deltaTime: number): GameState => {
      const predictedState = { ...state };
      const ticksPassed = Math.floor(deltaTime / SERVER_TICKRATE);

      predictedState.ball = {
        ...state.ball,
        x: state.ball.x + state.ball.velocityX * ticksPassed,
        y: state.ball.y + state.ball.velocityY * ticksPassed,
      };

      return predictedState;
    },
    []
  );

  const processPaddleMovement = useCallback(() => {
    const currentTime = performance.now();
    const moveInterval = FRAME_TIME;

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

  const renderGame = useCallback(
    (stateToRender: GameState) => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (!canvas || !context) return;

      context.fillStyle = "#000";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const currentCoords = {
        player1: calculateCoordinates(stateToRender.player1.paddle, canvas),
        player2: calculateCoordinates(stateToRender.player2.paddle, canvas),
        ball: calculateCoordinates(
          {
            ...stateToRender.ball,
            height: stateToRender.ball.radius * 2,
            width: stateToRender.ball.radius * 2,
          },
          canvas
        ),
        powerUps: stateToRender.powerUps
          ? stateToRender.powerUps.map((powerUp) => ({
              x: powerUp.x * canvas.width * 0.01,
              y: powerUp.y * canvas.height * 0.01,
              width: powerUp.width * canvas.width * 0.01,
              height: powerUp.width * canvas.width * 0.01,
            }))
          : [],
      };

      if (currentCoords.powerUps.length > 0) {
        currentCoords.powerUps.forEach((powerUp) => {
          drawPowerup(context, powerUp);
        });
      }

      drawPaddle(context, currentCoords.player1);
      drawPaddle(context, currentCoords.player2);
      drawBall(context, currentCoords.ball);
    },
    [calculateCoordinates, drawPaddle, drawBall, drawPowerup]
  );

  const gameLoop = useCallback(() => {
    const now = performance.now();
    lastFrameTimeRef.current = now;

    processPaddleMovement();

    if (gameState) {
      const timeSinceLastState = now - lastStateTimeRef.current;

      if (timeSinceLastState <= INTERPOLATION_DELAY) {
        const alpha = timeSinceLastState / INTERPOLATION_DELAY;
        const interpolatedState = interpolateState(
          previousGameState,
          gameState,
          alpha
        );
        if (interpolatedState) {
          renderGame(interpolatedState);
        }
      } else {
        const predictedState = predictState(
          gameState,
          timeSinceLastState - INTERPOLATION_DELAY
        );
        renderGame(predictedState);
      }
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [
    gameState,
    previousGameState,
    processPaddleMovement,
    interpolateState,
    predictState,
    renderGame,
  ]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on(
      "gameOver",
      (data: { winner: string; rematchTimeout: number }) => {
        setWinner(data.winner);
        setTimeLeft(10);
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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "w", "s"].includes(e.key)) {
      e.preventDefault();
    }
    keyRef.current[e.key] = true;
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keyRef.current[e.key] = false;
  }, []);

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
    requestRematch(gameId, userId, (errorMessage: string) => {
      setRematchRequested(false);
      setRematchError(errorMessage);
    });
  };

  const handleServerRematch = useCallback((rematchGameId: string) => {
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
  }, []);

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

    socket.emit("getGameState", { gameId });
    onGameStateUpdate(setGameState);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      offGameStateUpdate();
    };
  }, [handleKeyDown, handleKeyUp, gameId]);

  useEffect(() => {
    if (!gameState) return;

    lastFrameTimeRef.current = performance.now();
    lastStateTimeRef.current = performance.now();

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [gameState, gameLoop]);

  if (winner || opponentDisconnected) {
    return (
      <div className="game-over">
        {winner ? (
          <>
            <h2>Game Over!</h2>
            <p>
              {winner === "player1"
                ? gameState?.player1.username
                : gameState?.player2.username}{" "}
              wins!
            </p>
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
        player1Name={
          gameMode === "singleplayer" || gameMode === "localMultiplayer"
            ? gameState?.player1.username || "Player 1"
            : gameState?.player1.username || "Unknown"
        }
        player2Name={
          gameMode === "localMultiplayer"
            ? "Local Challenger"
            : gameMode === "remoteMultiplayer" &&
              gameState?.player2.id === getSocket()?.id
            ? gameState?.player2.username || "Unknown"
            : gameMode === "singleplayer" && !gameState?.player2.id
            ? "Bot"
            : gameState?.player2.username || "Unknown"
        }
      />
      <canvas ref={canvasRef} width={800} height={600} />
    </div>
  );
};

export default Game;
