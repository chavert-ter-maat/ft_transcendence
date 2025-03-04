export type PlayerKey = "player1" | "player2" | "default";

export interface MatchFoundData {
  gameId: string;
}

export interface CountdownData {
  gameId: string;
  duration: number;
}

export interface QueueStatusData {
  status: string;
}

export interface MovePaddleData {
  gameId: string;
  direction: "up" | "down";
  player?: number;
}

export interface RematchData {
  gameId: string;
}

export interface ErrorData {
  message: string;
}