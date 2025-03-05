import { io, Socket } from "socket.io-client";
import {
  GameState,
  PlayerKey,
  CountdownData,
  MatchFoundData,
  QueueStatusData,
  MovePaddleData,
  ErrorData,
} from "./types";

let socket: Socket | null = null;
const VITE_API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const connectSocket = () => {
  if (!socket) {
    socket = io(VITE_API_URL, {
      withCredentials: true,
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000,
      forceNew: false,
    });

    socket.on("connect", () => {
      if (socket) console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log("Socket disconnected");
    socket = null;
  }
};

export const getSocket = (): Socket => {
  if (!socket) {
    socket = connectSocket();
  }
  return socket;
};

export const onCountdown = (callback: (data: CountdownData) => void) => {
  socket?.on("countdown", callback);
};

export const offCountdown = () => {
  socket?.off("countdown");
};

export const onMatchFound = (callback: (data: MatchFoundData) => void) => {
  socket?.on("matchFound", callback);
};

export const offMatchFound = () => {
  socket?.off("matchFound");
};

export const onQueueStatus = (callback: (data: QueueStatusData) => void) => {
  socket?.on("queueStatus", callback);
};

export const offQueueStatus = () => {
  socket?.off("queueStatus");
};

export const joinQueue = (gameMode: string) => {
  socket?.emit("joinQueue", { gameMode });
};

export const joinGame = (
  gameMode: string,
  gameId: string | undefined,
  callback: (gameId: string) => void
) => {
  socket?.emit("joinGame", { gameMode, gameId });
  if (gameMode === "remoteMultiplayer") {
    socket?.on("matchFound", (data: MatchFoundData) => {
      callback(data.gameId);
    });
  } else {
    socket?.on("gameStarted", callback);
  }
};

const lastMoveTimes: Record<PlayerKey, number> = {
  player1: 0,
  player2: 0,
  default: 0,
};
const MOVE_THROTTLE = 16;

export const movePaddle = (
  gameId: string,
  direction: "up" | "down",
  player?: number
) => {
  const now = performance.now();
  const playerKey: PlayerKey = player
    ? (`player${player}` as PlayerKey)
    : "default";
  const lastTime = lastMoveTimes[playerKey];

  if (now - lastTime >= MOVE_THROTTLE) {
    const socket = getSocket();
    if (socket) {
      socket.emit("movePaddle", {
        gameId,
        direction,
        player,
      } as MovePaddleData);
      lastMoveTimes[playerKey] = now;
    }
  }
};

let lastGameStateTime = 0;
const STATE_UPDATE_THROTTLE = 16;

export const onGameStateUpdate = (callback: (gameState: GameState) => void) => {
  socket?.on("gameState", (gameState: GameState) => {
    const now = performance.now();
    if (now - lastGameStateTime >= STATE_UPDATE_THROTTLE) {
      callback(gameState);
      lastGameStateTime = now;
    }
  });
};

export const offGameStateUpdate = () => {
  socket?.off("gameState");
};

export const requestRematch = (
  gameId: string,
  onError?: (message: string) => void
) => {
  const socket = getSocket();
  if (socket) {
    socket.emit("requestRematch", { gameId });

    socket.once("error", (data: ErrorData) => {
      if (onError) {
        onError(data.message);
      }
    });
  }
};

export const onRematchStarted = (callback: (gameId: string) => void) => {
  socket?.on("rematchStarted", callback);
};

export const offRematchStarted = () => {
  socket?.off("rematchStarted");
};
