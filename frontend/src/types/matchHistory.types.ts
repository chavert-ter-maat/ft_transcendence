export interface MatchHistoryEntry {
  gameId: string;
  opponentUsername: string;
  userScore: number;
  opponentScore: number;
  gameMode: string;
  startTime: string;
  endTime: string;
  result: 'win' | 'loss';
}

export interface MatchHistoryResponse {
  matches: MatchHistoryEntry[];
  total: number;
}