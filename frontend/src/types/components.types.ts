import { GameMode } from "./game.types";

export interface SocketStatusProps {
  isConnected: boolean;
  socketId: string | null;
}

export interface GameProps {
	userId: string;
  gameMode: GameMode;
  gameId: string;
  setQueueStatus: React.Dispatch<React.SetStateAction<string>>;
  onGameStart: (gameMode: GameMode, gameId: string) => void;
}

export interface LobbyProps {
  onGameStart: (gameMode: GameMode, gameId: string) => void;
  queueStatus: string;
  setQueueStatus: React.Dispatch<React.SetStateAction<string>>;
  onBack?: () => void;
  invitePlayed: boolean
	setInvitePlayed: React.Dispatch<React.SetStateAction<boolean>>;
}
