export interface Player {
  id: string;
  username?: string;
  paddle: Paddle;
  score: number;
  inGame: boolean;
  activePowerups?: PowerUpEffect[];
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  speed: number;
}

export interface PowerUp {
  x: number;
  y: number;
  width: number;
  spawnTime: number;
}

export interface PowerUpEffect {
  endTime: number;
  effect: PowerUpEffectTypes;
}

export type PowerUpEffectTypes = "size";

export interface GameState {
  player1: Player;
  player2: Player;
  ball: Ball;
  gameStarted: Date;
  gameMode: GameMode;
  powerUps?: PowerUp[];
  rematchRequests?: string[];
}

export interface CoordinateCache {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
}

export type GameMode =
  | "singleplayer"
  | "localMultiplayer"
  | "remoteMultiplayer";
