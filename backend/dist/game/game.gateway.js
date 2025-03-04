"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GameGateway", {
    enumerable: true,
    get: function() {
        return GameGateway;
    }
});
const _websockets = require("@nestjs/websockets");
const _common = require("@nestjs/common");
const _socketio = require("socket.io");
const _gameservice = require("./game.service");
const _movepaddledto = require("./dto/move-paddle.dto");
const _joinGamedto = require("./dto/joinGame.dto");
const _queueservice = require("../queue/queue.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let GameGateway = class GameGateway {
    afterInit(server) {
        this.logger.log(`Server initiated`);
        this.gameService.setServer(server);
        this.queueService.setGateway(this);
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        this.connectedSockets.set(client.id, client);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.connectedSockets.delete(client.id);
        this.queueService.removePlayerFromQueue(client.id);
        this.gameService.handleDisconnect(client.id);
    }
    handleJoinGame(client, data) {
        if (data.gameMode === 'singleplayer') {
            const gameId = this.gameService.createSinglePlayerGame(client.id);
            client.join(gameId);
            this.server.to(gameId).emit('gameStarted', gameId);
        } else if (data.gameMode === 'localMultiplayer') {
            const gameId = this.gameService.createLocalMultiplayerGame(client.id);
            client.join(gameId);
            this.server.to(gameId).emit('gameStarted', gameId);
        } else if (data.gameMode === 'remoteMultiplayer') {
            client.emit('queueStatus', {
                status: 'waiting'
            });
        }
    }
    handleMovePaddle(client, MovePaddleDto) {
        const { gameId, direction, player } = MovePaddleDto;
        this.gameService.movePaddle(client.id, gameId, direction, player);
    }
    handleLeaveGame(client, data) {
        const gameState = this.gameService.getGameState(data.gameId);
        if (!gameState) return;
        this.server.to(data.gameId).emit('playerDisconnected');
        client.leave(data.gameId);
        this.gameService.removeGame(data.gameId);
    }
    handleGetGameState(client, data) {
        const gameState = this.gameService.getGameState(data.gameId);
        client.emit('gameState', gameState);
    }
    handleJoinQueue(client) {
        const result = this.queueService.addPlayerToQueue(client.id);
        if (result.message === 'Joined queue') {
            client.emit('queueStatus', {
                status: 'inQueue'
            });
        }
    }
    handleLeaveQueue(client) {
        this.queueService.removePlayerFromQueue(client.id);
    }
    handleRequestRematch(client, data) {
        console.log('rematch requested');
        const result = this.gameService.requestRematch(data.gameId, client.id);
        if (!result) {
            this.logger.error(`Rematch failed for gameId: ${data.gameId}`);
            client.emit('error', {
                message: 'Failed to start rematch'
            });
            return;
        }
        if ('message' in result) {
            this.logger.error(`Rematch failed: ${result.message}`);
            client.emit('error', {
                message: result.message
            });
            return;
        }
        client.leave(data.gameId);
        client.join(result.gameId);
        if (result.gameMode === 'singleplayer' || result.gameMode === 'localMultiplayer') {
            client.emit('rematchStarted', result.gameId);
            client.emit('gameStarted', result.gameId);
        }
    }
    constructor(gameService, queueService){
        this.gameService = gameService;
        this.queueService = queueService;
        this.logger = new _common.Logger(GameGateway.name);
        this.connectedSockets = new Map();
    }
};
_ts_decorate([
    (0, _websockets.WebSocketServer)(),
    _ts_metadata("design:type", typeof _socketio.Server === "undefined" ? Object : _socketio.Server)
], GameGateway.prototype, "server", void 0);
_ts_decorate([
    (0, _websockets.SubscribeMessage)('joinGame'),
    _ts_param(0, (0, _websockets.ConnectedSocket)()),
    _ts_param(1, (0, _websockets.MessageBody)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _socketio.Socket === "undefined" ? Object : _socketio.Socket,
        typeof _joinGamedto.JoinGameDto === "undefined" ? Object : _joinGamedto.JoinGameDto
    ]),
    _ts_metadata("design:returntype", void 0)
], GameGateway.prototype, "handleJoinGame", null);
_ts_decorate([
    (0, _websockets.SubscribeMessage)('movePaddle'),
    _ts_param(0, (0, _websockets.ConnectedSocket)()),
    _ts_param(1, (0, _websockets.MessageBody)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _socketio.Socket === "undefined" ? Object : _socketio.Socket,
        typeof _movepaddledto.MovePaddleDto === "undefined" ? Object : _movepaddledto.MovePaddleDto
    ]),
    _ts_metadata("design:returntype", void 0)
], GameGateway.prototype, "handleMovePaddle", null);
_ts_decorate([
    (0, _websockets.SubscribeMessage)('leaveGame'),
    _ts_param(0, (0, _websockets.ConnectedSocket)()),
    _ts_param(1, (0, _websockets.MessageBody)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _socketio.Socket === "undefined" ? Object : _socketio.Socket,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], GameGateway.prototype, "handleLeaveGame", null);
_ts_decorate([
    (0, _websockets.SubscribeMessage)('getGameState'),
    _ts_param(0, (0, _websockets.ConnectedSocket)()),
    _ts_param(1, (0, _websockets.MessageBody)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _socketio.Socket === "undefined" ? Object : _socketio.Socket,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], GameGateway.prototype, "handleGetGameState", null);
_ts_decorate([
    (0, _websockets.SubscribeMessage)('joinQueue'),
    _ts_param(0, (0, _websockets.ConnectedSocket)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _socketio.Socket === "undefined" ? Object : _socketio.Socket
    ]),
    _ts_metadata("design:returntype", void 0)
], GameGateway.prototype, "handleJoinQueue", null);
_ts_decorate([
    (0, _websockets.SubscribeMessage)('leaveQueue'),
    _ts_param(0, (0, _websockets.ConnectedSocket)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _socketio.Socket === "undefined" ? Object : _socketio.Socket
    ]),
    _ts_metadata("design:returntype", void 0)
], GameGateway.prototype, "handleLeaveQueue", null);
_ts_decorate([
    (0, _websockets.SubscribeMessage)('requestRematch'),
    _ts_param(0, (0, _websockets.ConnectedSocket)()),
    _ts_param(1, (0, _websockets.MessageBody)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _socketio.Socket === "undefined" ? Object : _socketio.Socket,
        Object
    ]),
    _ts_metadata("design:returntype", void 0)
], GameGateway.prototype, "handleRequestRematch", null);
GameGateway = _ts_decorate([
    (0, _websockets.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_PORT ? [
                `http://localhost:${process.env.FRONTEND_PORT}`
            ] : [
                'http://localhost:5173'
            ],
            methods: [
                'GET',
                'POST',
                'PUT',
                'DELETE',
                'OPTIONS'
            ],
            credentials: true,
            allowedHeaders: [
                'Content-Type',
                'Authorization'
            ]
        },
        transports: [
            'websocket'
        ],
        pingInterval: 1000,
        pingTimeout: 5000
    }),
    _ts_param(0, (0, _common.Inject)((0, _common.forwardRef)(()=>_gameservice.GameService))),
    _ts_param(1, (0, _common.Inject)((0, _common.forwardRef)(()=>_queueservice.QueueService))),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _gameservice.GameService === "undefined" ? Object : _gameservice.GameService,
        typeof _queueservice.QueueService === "undefined" ? Object : _queueservice.QueueService
    ])
], GameGateway);

//# sourceMappingURL=game.gateway.js.map