export type CustomGameModes = "singleplayer" | "local-multiplayer";

export interface CustomGameCreationProps {
  onGameStart: (gameMode: string, gameId: string) => void;
  setQueueStatus: (status: string) => void;
}