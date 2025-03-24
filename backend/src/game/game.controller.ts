import { Controller, Get } from '@nestjs/common';
import { GameService } from './game.service';
import { LeaderboardEntryDto } from './dto/leaderboard-entry.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('leaderboard')
  async getLeaderboard(): Promise<LeaderboardEntryDto[]> {
    const matches = await this.gameService.getLeaderboard();
    const playerStats = new Map();

    matches.forEach((match) => {
      if (!playerStats.has(match.player1Username)) {
        playerStats.set(match.player1Username, {
          wins: 0,
          losses: 0,
          totalGames: 0,
          totalScore: 0,
        });
      }
      if (!playerStats.has(match.player2Username)) {
        playerStats.set(match.player2Username, {
          wins: 0,
          losses: 0,
          totalGames: 0,
          totalScore: 0,
        });
      }

      const player1Stats = playerStats.get(match.player1Username);
      const player2Stats = playerStats.get(match.player2Username);

      if (match.winnerUsername === match.player1Username) {
        player1Stats.wins++;
        player2Stats.losses++;
      } else {
        player2Stats.wins++;
        player1Stats.losses++;
      }

      player1Stats.totalGames++;
      player2Stats.totalGames++;
      player1Stats.totalScore += match.player1Score;
      player2Stats.totalScore += match.player2Score;
    });

    const leaderboardData = Array.from(playerStats.entries()).map(
      ([username, stats]) => ({
        username,
        wins: stats.wins,
        losses: stats.losses,
        totalGames: stats.totalGames,
        totalScore: stats.totalScore,
        winRate: ((stats.wins / stats.totalGames) * 100).toFixed(1),
      }),
    );

    return leaderboardData.sort((a, b) => b.wins - a.wins);
  }
}
