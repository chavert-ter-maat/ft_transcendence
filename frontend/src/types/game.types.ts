export interface Player {
  id: string;
  paddle: Paddle;
  score: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
}

export interface PowerUp {
  x: number;
  y: number;
  width: number;
}

export interface GameState {
  player1: Player;
  player2: Player;
  ball: Ball;
  gameStarted: Date;
  gameMode: GameMode;
  powerUp?: PowerUp;
}

export interface CoordinateCache {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
}

export type GameMode = "singleplayer" | "localMultiplayer" | "remoteMultiplayer";