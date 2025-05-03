export class JoinGameDto {
  gameMode: 'singleplayer' | 'localMultiplayer' | 'remoteMultiplayer';
  gameId?: string;
  enablePowerups?: boolean;
  invitedOpponent?: string; 
}
