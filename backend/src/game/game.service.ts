import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Match } from './entities/match.entity';
import { QueueService } from './queue/queue.service';
import { GameGateway } from './game.gateway';
import {
  GameState,
  Paddle,
  Ball,
  GameMode,
} from './entities/game-state.entity';
import { v4 as uuid } from 'uuid';
import { Server } from 'socket.io';

const SERVER_TICKRATE = 1000 / 60;

const GAME_PARAMETERS = {
  score_limit: 2,
  ball: {
    initialX: 50,
    initialY: 50,
    radius: 2,
    initialVelocityX: 0.5,
    initialVelocityY: 0.5,
    initialSpeed: 0.75,
  },
  paddles: {
    size: 10,
    speed: 1,
  },
};

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Match)
    readonly matchModel: typeof Match,
    @Inject(forwardRef(() => QueueService))
    readonly queueService: QueueService,
    @Inject(forwardRef(() => GameGateway))
    private readonly gameGateway: GameGateway,
  ) {
    setInterval(() => {
      this.logger.log(
        `[METRICS] Active Games: ${this.games.size} | ` +
          `Player Mappings: ${this.playerGameMap.size} | ` +
          `Queue Length: ${this.queueService.queueLength}`,
      );
    }, 60000);
  }

  private server: Server | null = null;
  private rematchRequests: Map<string, string[]> = new Map();
  private games: Map<string, GameState> = new Map();
  private playerGameMap: Map<string, string> = new Map();
  private readonly logger = new Logger(GameService.name);

  setServer(server: Server) {
    this.server = server;
  }

  private async saveMatchResult(gameState: GameState) {
    if (gameState.gameMode === 'remoteMultiplayer') {
      try {
        // Use usernames directly from GameState
        const gameId = this.playerGameMap.get(gameState.player1.id);
        if (gameId) {
          await this.matchModel.create({
            gameId,
            player1Username: gameState.player1.username,
            player2Username: gameState.player2.username,
            player1Score: gameState.player1.score,
            player2Score: gameState.player2.score,
            gameMode: gameState.gameMode,
            startTime: gameState.gameStarted,
            endTime: new Date(),
            winnerUsername:
              gameState.player1.score > gameState.player2.score
                ? gameState.player1.username
                : gameState.player2.username,
          });
        }
      } catch (error) {
        this.logger.error('Error saving match result:', error);
      }
    }
  }

  private handleGameEnd(gameId: string) {
    const gameState = this.games.get(gameId);
    if (gameState) {
      this.saveMatchResult(gameState);
      if (gameState.gameMode === 'remoteMultiplayer') {
        this.playerGameMap.delete(gameState.player1.id);
        this.playerGameMap.delete(gameState.player2.id);
      }
    }
  }

  private initializeGameState(
    gameMode: GameMode,
    enablePowerups: boolean = true,
  ): GameState {
    const initialPaddle: Paddle = {
      x: 0,
      y: 45,
      width: 2,
      height: 10,
      speed: 1,
    };

    const initialBall: Ball = {
      x: GAME_PARAMETERS.ball.initialX,
      y: GAME_PARAMETERS.ball.initialY,
      radius: GAME_PARAMETERS.ball.radius,
      velocityX: GAME_PARAMETERS.ball.initialVelocityX,
      velocityY: GAME_PARAMETERS.ball.initialVelocityY,
      speed: GAME_PARAMETERS.ball.initialSpeed,
    };

    return {
      player1: {
        id: '',
        username: '',
        paddle: { ...initialPaddle, x: 2 },
        score: 0,
        inGame: true,
        activePowerups: undefined,
      },
      player2: {
        id: '',
        username: '',
        paddle: { ...initialPaddle, x: 96 },
        score: 0,
        inGame: true,
        activePowerups: undefined,
      },
      ball: initialBall,
      gameStarted: new Date(),
      roundStartTime: Date.now(),
      gameMode,
      enablePowerups,
      powerUps: [],
    };
  }

  createSinglePlayerGame(
    playerId: string,
    enablePowerups: boolean = true,
  ): string {
    const gameId = uuid();
    const gameState = this.initializeGameState('singleplayer', enablePowerups);
    gameState.player1.id = playerId;
    gameState.player1.username =
      this.gameGateway.getUsernameById(playerId) || 'Unknown';
    gameState.player2.id = 'Bot';
    gameState.player2.username = 'Bot';
    this.games.set(gameId, gameState);
    this.playerGameMap.set(gameState.player1.id, gameId);
    this.startGameLoop(gameId);
    return gameId;
  }

  createLocalMultiplayerGame(
    playerId: string,
    enablePowerups: boolean = true,
  ): string {
    const gameId = uuid();
    const gameState = this.initializeGameState(
      'localMultiplayer',
      enablePowerups,
    );
    gameState.player1.id = playerId;
    gameState.player2.id = 'Local Challenger';
    this.games.set(gameId, gameState);
    this.playerGameMap.set(playerId, gameId);
    this.playerGameMap.set(gameState.player2.id, gameId);
    this.startGameLoop(gameId);
    return gameId;
  }

  createPrivateGame(player1Id: string, player2Id: string): string {
    const gameId = uuid();
    const gameState = this.initializeGameState('privateMatch', true);

    // Get usernames from GameGateway's mapping
    const player1Username = this.gameGateway.getUsernameById(player1Id);
    const player2Username = this.gameGateway.getUsernameById(player2Id);

    gameState.player1.id = player1Id;
    gameState.player1.username = player1Username || 'Unknown';

    gameState.player2.id = player2Id;
    gameState.player2.username = player2Username || 'Unknown';

    this.games.set(gameId, gameState);
    this.playerGameMap.set(player1Id, gameId);
    this.playerGameMap.set(player2Id, gameId);
    this.startGameLoop(gameId);
    return gameId;
  }

  getGames(): Map<string, GameState> {
    return this.games;
  }

  createRemoteMultiplayerGame(player1Id: string, player2Id: string): string {
    const gameId = uuid();
    const gameState = this.initializeGameState('remoteMultiplayer', true);

    // Get usernames from GameGateway's mapping
    const player1Username = this.gameGateway.getUsernameById(player1Id);
    const player2Username = this.gameGateway.getUsernameById(player2Id);

    gameState.player1.id = player1Id;
    gameState.player1.username = player1Username || 'Unknown';

    gameState.player2.id = player2Id;
    gameState.player2.username = player2Username || 'Unknown';

    this.games.set(gameId, gameState);

    this.playerGameMap.set(player1Id, gameId);
    this.playerGameMap.set(player2Id, gameId);
    this.startGameLoop(gameId);
    return gameId;
  }

  addPlayerToGame(gameId: string, playerId: string): void {
    this.playerGameMap.set(playerId, gameId);
  }

  movePaddle(
    playerId: string,
    gameId: string,
    direction: 'up' | 'down',
    player?: number,
  ) {
    const game = this.games.get(gameId);
    if (!game) return;

    let paddle;
    if (player === 1) {
      paddle = game.player1.paddle;
    } else if (player === 2) {
      paddle = game.player2.paddle;
    } else {
      const playerIndex = this.getPlayerIndex(playerId, gameId);
      paddle = playerIndex === 0 ? game.player1.paddle : game.player2.paddle;
    }

    if (direction === 'up') {
      paddle.y -= paddle.speed;
    } else if (direction === 'down') {
      paddle.y += paddle.speed;
    }

    paddle.y = Math.max(0, Math.min(paddle.y, 100 - paddle.height));
  }

  getGameState(gameId: string): GameState | undefined {
    return this.games.get(gameId);
  }

  handleDisconnect(playerId: string) {
    const gameId = this.playerGameMap.get(playerId);
    if (gameId) {
      const game = this.games.get(gameId);
      if (game) {
        if (game.player1.id === playerId) {
          game.player1.inGame = false;
        } else if (game.player2.id === playerId) {
          game.player2.inGame = false;
        }

        this.server?.to(gameId).emit('playerDisconnected');
        this.games.delete(gameId);

        this.playerGameMap.delete(playerId);
        if (game.player1.id !== playerId) {
          this.playerGameMap.delete(game.player1.id);
        }
        if (game.player2.id !== playerId) {
          this.playerGameMap.delete(game.player2.id);
        }
      }
    }
  }

  removeGame(gameId: string) {
    const game = this.games.get(gameId);
    if (game) {
      if (game.player1?.id) {
        this.playerGameMap.delete(game.player1.id);
      }
      if (game.player2?.id) {
        this.playerGameMap.delete(game.player2.id);
      }
      this.games.delete(gameId);
    }
  }

  private startGameLoop(gameId: string) {
    const intervalId = setInterval(() => {
      const game = this.games.get(gameId);
      if (!game || !game.player1.inGame || !game.player2.inGame) {
        clearInterval(intervalId);
        if (game && (!game.player1.inGame || !game.player2.inGame)) {
          this.server?.to(gameId).emit('playerDisconnected');
          this.games.delete(gameId);
        }
        return;
      }

      this.updateGame(gameId, game);

      if (
        game.player1.score >= GAME_PARAMETERS.score_limit ||
        game.player2.score >= GAME_PARAMETERS.score_limit
      ) {
        const winner =
          game.player1.score >= GAME_PARAMETERS.score_limit
            ? 'player1'
            : 'player2';
        this.server?.to(gameId).emit('gameOver', {
          winner,
          rematchTimeout: Date.now() + 10000,
        });
        this.handleGameEnd(gameId);
        clearInterval(intervalId);
        setTimeout(() => {
          const gameExists = this.games.get(gameId);
          if (gameExists && !this.rematchRequests.has(gameId)) {
            this.games.delete(gameId);
            if (game.gameMode === 'singleplayer') {
              this.playerGameMap.delete(game.player1.id);
            } else if (game.gameMode === 'localMultiplayer') {
              this.playerGameMap.delete(game.player1.id);
              this.playerGameMap.delete(game.player2.id);
            }
          }
        }, 11000);
      }
    }, SERVER_TICKRATE);
  }

  private updateGame(gameId: string, game: GameState) {
    const now = Date.now();
    const isSinglePlayer = game.gameMode === 'singleplayer';

    [game.player1, game.player2].forEach((player) => {
      if (player.activePowerups && now >= player.activePowerups.endTime) {
        if (player.activePowerups.effect === 'size') {
          player.paddle.height = GAME_PARAMETERS.paddles.size;
        }
        player.activePowerups = undefined;
      }
    });

    if (!game.powerUps) {
      game.powerUps = [];
    }

    if (
      game.enablePowerups &&
      game.powerUps.length < 2 &&
      now - (game.lastPowerUpSpawn || 0) >= 5000 &&
      now - game.roundStartTime >= 5000
    ) {
      game.powerUps.push({
        x: 20 + Math.random() * 60,
        y: 10 + Math.random() * 80,
        width: 3,
        spawnTime: now,
      });
      game.lastPowerUpSpawn = now;
    }

    game.powerUps = game.powerUps.filter(
      (powerUp) => now - powerUp.spawnTime < 8000,
    );

    game.powerUps = game.powerUps.filter((powerUp) => {
      const ballLeft = game.ball.x - game.ball.radius;
      const ballRight = game.ball.x + game.ball.radius;
      const ballTop = game.ball.y - game.ball.radius;
      const ballBottom = game.ball.y + game.ball.radius;

      const powerUpLeft = powerUp.x;
      const powerUpRight = powerUp.x + powerUp.width;
      const powerUpTop = powerUp.y;
      const powerUpBottom = powerUp.y + powerUp.width;

      if (
        ballRight > powerUpLeft &&
        ballLeft < powerUpRight &&
        ballBottom > powerUpTop &&
        ballTop < powerUpBottom
      ) {
        const affectedPlayer =
          game.ball.velocityX > 0 ? game.player1 : game.player2;

        affectedPlayer.activePowerups = {
          endTime: Date.now() + 10000,
          effect: 'size',
        };
        affectedPlayer.paddle.height = GAME_PARAMETERS.paddles.size * 2;
        return false;
      }
      return true;
    });

    if (isSinglePlayer) {
      this.moveBotPaddle(game.player2.paddle, game.ball);
    }

    game.ball.x += game.ball.velocityX;
    game.ball.y += game.ball.velocityY;

    if (game.ball.y + game.ball.radius > 100) {
      game.ball.y = 100 - game.ball.radius;
      game.ball.velocityY = -game.ball.velocityY;
    } else if (game.ball.y - game.ball.radius < 0) {
      game.ball.y = game.ball.radius;
      game.ball.velocityY = -game.ball.velocityY;
    }

    this.checkPaddleCollision(game.player1.paddle, game.ball);
    this.checkPaddleCollision(game.player2.paddle, game.ball);

    if (game.ball.x + game.ball.radius < 0) {
      game.player2.score++;
      game.roundStartTime = this.resetBall(game.ball, game);
    } else if (game.ball.x - game.ball.radius > 100) {
      game.player1.score++;
      game.roundStartTime = this.resetBall(game.ball, game);
    }
    this.server?.to(gameId).emit('gameState', game);
  }

  private moveBotPaddle(paddle: Paddle, ball: Ball) {
    const paddleCenter = paddle.y + paddle.height / 2;
    if (paddleCenter < ball.y - 5) {
      paddle.y += paddle.speed;
    } else if (paddleCenter > ball.y + 5) {
      paddle.y -= paddle.speed;
    }
    paddle.y = Math.max(0, Math.min(paddle.y, 100 - paddle.height));
  }

  private checkPaddleCollision(paddle: Paddle, ball: Ball) {
    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.height;
    const paddleLeft = paddle.x;
    const paddleRight = paddle.x + paddle.width;

    const ballTop = ball.y - ball.radius;
    const ballBottom = ball.y + ball.radius;
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;

    if (
      ballRight > paddleLeft &&
      ballTop < paddleBottom &&
      ballLeft < paddleRight &&
      ballBottom > paddleTop
    ) {
      ball.velocityX = -ball.velocityX;

      const contactPoint = ball.y - (paddle.y + paddle.height / 2);
      const normalizedContactPoint = contactPoint / (paddle.height / 2);
      const angleRad = (Math.PI / 4) * normalizedContactPoint;
      const direction = ball.x < 50 ? 1 : -1;
      ball.velocityX = direction * ball.speed * Math.cos(angleRad);
      ball.velocityY = ball.speed * Math.sin(angleRad);
      ball.speed += 0.05;
      ball.speed = Math.min(ball.speed, 2.0);
    }
  }

  requestRematch(gameId: string, playerId: string) {
    const game = this.games.get(gameId);
    if (!game) {
      return { message: 'Game not found', gameId };
    }

    if (game.gameMode === 'remoteMultiplayer') {
      return {
        message: 'Rematch not available in Remote Multiplayer mode',
        gameId,
      };
    }

    if (!this.rematchRequests.has(gameId)) {
      this.rematchRequests.set(gameId, []);
    }

    const requests = this.rematchRequests.get(gameId)!;
    if (!requests.includes(playerId)) {
      requests.push(playerId);
    }

    const gameMode = game.gameMode;

    if (
      (gameMode === 'singleplayer' || gameMode === 'localMultiplayer') &&
      requests.length >= 1
    ) {
      return this.startRematch(gameId);
    }
    return { message: 'Rematch requested', gameId };
  }

  private startRematch(gameId: string) {
    const existingGame = this.games.get(gameId);
    if (!existingGame) {
      this.logger.error(`Game ID ${gameId} not found for rematch.`);
      return { message: 'Game not found', gameId };
    }

    this.games.delete(gameId);

    const newGameId = uuid();
    const gameMode = existingGame.gameMode;
    const gameState = this.initializeGameState(
      gameMode,
      existingGame.enablePowerups,
    );

    if (gameMode === 'singleplayer') {
      gameState.player1.id = existingGame.player1.id;
      this.playerGameMap.delete(existingGame.player1.id);
      this.playerGameMap.set(existingGame.player1.id, newGameId);
    } else {
      gameState.player1.id = existingGame.player1.id;
      gameState.player2.id = existingGame.player2.id;
      this.playerGameMap.delete(existingGame.player1.id);
      this.playerGameMap.delete(existingGame.player2.id);
      this.playerGameMap.set(existingGame.player1.id, newGameId);
      this.playerGameMap.set(existingGame.player2.id, newGameId);
    }

    this.games.set(newGameId, gameState);
    this.startGameLoop(newGameId);
    this.rematchRequests.delete(gameId);
    return { gameId: newGameId, gameMode };
  }

  private resetBall(ball: Ball, game: GameState) {
    ball.x = GAME_PARAMETERS.ball.initialX;
    ball.y = GAME_PARAMETERS.ball.initialY;
    ball.velocityX =
      GAME_PARAMETERS.ball.initialVelocityX * (ball.velocityX > 0 ? -1 : 1);
    ball.velocityY =
      GAME_PARAMETERS.ball.initialVelocityY * (ball.velocityY > 0 ? -1 : 1);
    ball.speed = GAME_PARAMETERS.ball.initialSpeed;

    game.powerUps = [];
    game.lastPowerUpSpawn = undefined;

    return Date.now();
  }

  async getLeaderboard() {
    const matches = await this.matchModel.findAll({
      where: {
        gameMode: 'remoteMultiplayer',
      },
    });
    return matches;
  }

  private getPlayerIndex(playerId: string, gameId: string): number {
    const game = this.games.get(gameId);
    if (!game) return -1;

    let index = 0;
    for (const [key, value] of this.playerGameMap) {
      if (value === gameId) {
        if (key === playerId) {
          return index;
        }
        index++;
      }
    }
    return -1;
  }
}
