export class MatchHistoryEntryDto {
  gameId: string;
  opponentUsername: string;
  userScore: number;
  opponentScore: number;
  gameMode: string;
  startTime: Date;
  endTime: Date;
  result: 'win' | 'loss';
}

export class MatchHistoryResponseDto {
  matches: MatchHistoryEntryDto[];
  total: number;
}
