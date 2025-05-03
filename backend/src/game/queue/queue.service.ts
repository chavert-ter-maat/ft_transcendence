import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { GameService } from '../game.service';
import { GameGateway } from '../game.gateway';

@Injectable()
export class QueueService {
  private queue: string[] = [];

  get queueLength(): number {
    return this.queue.length;
  }

  constructor(
    @Inject(forwardRef(() => GameService))
    readonly gameService: GameService,
  ) {}

  private gameGateway: GameGateway;

  setGateway(gateway: GameGateway) {
    this.gameGateway = gateway;
  }

  addPlayerToQueue(playerId: string) {
    const socket = this.gameGateway.connectedSockets.get(playerId);
    if (!socket) {
      return { message: 'Error: Invalid socket ID', playerId };
    }

    if (!this.queue.includes(playerId)) {
      console.log('Adding player to queue:', playerId);
      this.queue.push(playerId);
      console.log('Current queue:', this.queue);
      this.tryMatchPlayers();
      return { message: 'Joined queue', playerId };
    }
    return { message: 'Error: Already in queue', playerId };
  }

  removePlayerFromQueue(playerId: string) {
    this.queue = this.queue.filter((id) => id !== playerId);
    return { message: 'Left queue', playerId };
  }

  private tryMatchPlayers() {
    if (this.queue.length >= 2) {
      const player1 = this.queue.shift();
      const player2 = this.queue.shift();

      if (!player1 || !player2) {
        return;
      }

      const socket1 = this.gameGateway.connectedSockets.get(player1);
      const socket2 = this.gameGateway.connectedSockets.get(player2);

      const tempLobby = `lobby-${player1}-${player2}`;
      if (socket1) socket1.join(tempLobby);
      if (socket2) socket2.join(tempLobby);

      this.gameGateway.server
        .to([player1, player2])
        .emit('queueStatus', { status: 'matched' });

      const waitTime = 5;

      this.gameGateway.server
        .to([player1, player2])
        .emit('countdown', { gameId: null, waitTime });

      setTimeout(() => {
        if (!socket1?.connected || !socket2?.connected) {
          if (socket1?.connected) {
            this.queue.push(player1);
            socket1?.emit('queueStatus', { status: 'inQueue' });
          }
          if (socket2?.connected) {
            this.queue.push(player2);
            socket2?.emit('queueStatus', { status: 'inQueue' });
          }
          return;
        }

        const player1Username = this.gameGateway.getUsernameById(player1);
        const player2Username = this.gameGateway.getUsernameById(player2);

        console.log('Creating game with players:', {
          player1: { id: player1, username: player1Username },
          player2: { id: player2, username: player2Username },
        });

        const gameId = this.gameService.createRemoteMultiplayerGame(
          player1,
          player2,
        );
        this.gameService.addPlayerToGame(gameId, player2);

        socket1?.join(gameId);
        socket2?.join(gameId);

        this.gameGateway.server.to(gameId).emit('matchFound', { gameId });
      }, waitTime * 1000);
    }
  }

  startPrivateGame(player1: string, player2: string) {
    if (!player1 || !player2) {
      return;
    }

    const socket1 = this.gameGateway.connectedSockets.get(player1);
    const socket2 = this.gameGateway.connectedSockets.get(player2);

    const tempLobby = `lobby-${player1}-${player2}`;
    if (socket1) socket1.join(tempLobby);
    if (socket2) socket2.join(tempLobby);

    this.gameGateway.server
      .to([player1, player2])
      .emit('queueStatus', { status: 'matched' });

    const waitTime = 5;

    this.gameGateway.server
      .to([player1, player2])
      .emit('countdown', { gameId: null, waitTime });

    setTimeout(() => {
      if (!socket1?.connected || !socket2?.connected) {
        return;
      }

      const gameId = this.gameService.createPrivateGame(player1, player2);
      this.gameService.addPlayerToGame(gameId, player2);

      socket1?.join(gameId);
      socket2?.join(gameId);

	  this.gameGateway.server.to(gameId).emit('matchFound', { gameId });
    }, waitTime * 1000);
  }
}
