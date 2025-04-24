import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Inject, forwardRef, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { MovePaddleDto } from './dto/move-paddle.dto';
import { JoinGameDto } from './dto/joinGame.dto';
import { QueueService } from 'src/game/queue/queue.service';
import { OnlineService } from 'src/messages/online.service';

@WebSocketGateway({
  cors: {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  transports: ['websocket'],
  pingInterval: 3000,
  pingTimeout: 5000,
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(GameGateway.name);
  @WebSocketServer()
  server: Server;
  public connectedSockets = new Map<string, Socket>();
  private usernames = new Map<string, string>();
  private clientid = new Map<string, string>();

  constructor(
    @Inject(forwardRef(() => GameService))
    private readonly gameService: GameService,
    @Inject(forwardRef(() => QueueService))
    private readonly queueService: QueueService,
	private readonly onlineService: OnlineService,
  ) {}

  afterInit(server: Server) {
    this.logger.log(`Server initiated`);
    this.gameService.setServer(server);
    this.queueService.setGateway(this);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedSockets.set(client.id, client);

    const username = client.handshake.auth.username;

	this.onlineService.online_users.add_online_user(username, "", "online");
	this.onlineService.add_users([[{name_: username, admin_: false, timestamp: Date()}], ""]);
	this.onlineService.notify_friends(username);

    this.logger.log(`Socket ${client.id} auth:`, client.handshake.auth);
    if (username) {
      this.logger.log(`Setting username for ${client.id}: ${username}`);
      this.usernames.set(client.id, username);
	  this.clientid.set(username, client.id);

      for (const [gameId, game] of this.gameService.getGames()) {
        if (game.player1.id === client.id) {
          game.player1.username = username;
        }
        if (game.player2.id === client.id) {
          game.player2.username = username;
        }
      }
    } else {
      this.logger.warn(`No username provided for socket ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
	this.onlineService.online_users.remove_user(this.usernames.get(client.id));
	this.onlineService.remove_user(this.usernames.get(client.id));
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedSockets.delete(client.id);
	this.clientid.delete(this.usernames.get(client.id));
    this.usernames.delete(client.id);
    this.queueService.removePlayerFromQueue(client.id);
    this.gameService.handleDisconnect(client.id);

    client.rooms.forEach((room) => {
      client.leave(room);
    });
  }

  getUsernameById(socketId: string): string | undefined {
    const username = this.usernames.get(socketId);
    this.logger.log(
      `Looking up username for ${socketId}: ${username || 'not found'}`,
    );
    this.logger.debug('Current usernames:', Object.fromEntries(this.usernames));
    return username;
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinGameDto,
  ) {
	this.onlineService.online_users.find_online_user(this.usernames.get(client.id)).location = "in game";
	this.onlineService.notify_friends(this.usernames.get(client.id));
    if (data.gameMode === 'singleplayer') {
      const gameId = this.gameService.createSinglePlayerGame(
        client.id,
        data.enablePowerups,
      );
      client.join(gameId);
      this.server.to(gameId).emit('gameStarted', gameId);
    } else if (data.gameMode === 'localMultiplayer') {
      const gameId = this.gameService.createLocalMultiplayerGame(
        client.id,
        data.enablePowerups,
      );
      client.join(gameId);
      this.server.to(gameId).emit('gameStarted', gameId);
    } else if (data.gameMode === 'remoteMultiplayer') {
      client.emit('queueStatus', { status: 'waiting' });
      this.queueService.addPlayerToQueue(client.id);
    } else if (data.invitedOpponent !== ''){
		client.emit('queueStatus', { status: 'waiting' });
		this.queueService.startPrivateGame(client.id, this.clientid.get(data.invitedOpponent));
	}
  }

  @SubscribeMessage('movePaddle')
  handleMovePaddle(
    @ConnectedSocket() client: Socket,
    @MessageBody() MovePaddleDto: MovePaddleDto,
  ) {
    const { gameId, direction, player } = MovePaddleDto;
    this.gameService.movePaddle(client.id, gameId, direction, player);
  }

  @SubscribeMessage('leaveGame')
  handleLeaveGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
	this.onlineService.online_users.find_online_user(this.usernames.get(client.id)).location = "online";
	this.onlineService.notify_friends(this.usernames.get(client.id));
    const gameState = this.gameService.getGameState(data.gameId);
    if (!gameState) return;

    this.server.to(data.gameId).emit('playerDisconnected');

    client.leave(data.gameId);
    this.gameService.removeGame(data.gameId);
  }

  @SubscribeMessage('getGameState')
  handleGetGameState(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const gameState = this.gameService.getGameState(data.gameId);
    client.emit('gameState', gameState);
  }

  @SubscribeMessage('joinQueue')
  handleJoinQueue(@ConnectedSocket() client: Socket) {
    client.emit('queueStatus', { status: 'inQueue' });
    const result = this.queueService.addPlayerToQueue(client.id);
    if (result.message !== 'Joined queue') {
      client.emit('queueStatus', { status: 'error' });
    }
  }

  @SubscribeMessage('leaveQueue')
  handleLeaveQueue(@ConnectedSocket() client: Socket) {
    this.queueService.removePlayerFromQueue(client.id);
  }

  @SubscribeMessage('requestRematch')
  handleRequestRematch(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    console.log('rematch requested');
    const result = this.gameService.requestRematch(data.gameId, client.id);

    if (!result) {
      this.logger.error(`Rematch failed for gameId: ${data.gameId}`);
      client.emit('error', { message: 'Failed to start rematch' });
      return;
    }

    if ('message' in result) {
      this.logger.error(`Rematch failed: ${result.message}`);
      client.emit('error', { message: result.message });
      return;
    }

    client.leave(data.gameId);
    client.join(result.gameId);

    if (
      result.gameMode === 'singleplayer' ||
      result.gameMode === 'localMultiplayer'
    ) {
      client.emit('rematchStarted', result.gameId);
      client.emit('gameStarted', result.gameId);
    }
  }
}
