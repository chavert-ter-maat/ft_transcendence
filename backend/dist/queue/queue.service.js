"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "QueueService", {
    enumerable: true,
    get: function() {
        return QueueService;
    }
});
const _common = require("@nestjs/common");
const _gameservice = require("../game/game.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let QueueService = class QueueService {
    setGateway(gateway) {
        this.gameGateway = gateway;
    }
    addPlayerToQueue(playerId) {
        const socket = this.gameGateway.connectedSockets.get(playerId);
        if (!socket) {
            return {
                message: 'Error: Invalid socket ID',
                playerId
            };
        }
        if (!this.queue.includes(playerId)) {
            console.log('Adding player to queue:', playerId);
            this.queue.push(playerId);
            console.log('Current queue:', this.queue);
            this.tryMatchPlayers();
            return {
                message: 'Joined queue',
                playerId
            };
        }
        return {
            message: 'Error: Already in queue',
            playerId
        };
    }
    removePlayerFromQueue(playerId) {
        this.queue = this.queue.filter((id)=>id !== playerId);
        return {
            message: 'Left queue',
            playerId
        };
    }
    tryMatchPlayers() {
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
            const duration = 5;
            this.gameGateway.server.to([
                player1,
                player2
            ]).emit('countdown', {
                gameId: null,
                duration
            });
            socket1?.emit('queueStatus', {
                status: 'matched'
            });
            socket2?.emit('queueStatus', {
                status: 'matched'
            });
            setTimeout(()=>{
                if (!socket1?.connected || !socket2?.connected) {
                    if (socket1?.connected) {
                        this.queue.push(player1);
                        socket1?.emit('queueStatus', {
                            status: 'inQueue'
                        });
                    }
                    if (socket2?.connected) {
                        this.queue.push(player2);
                        socket2?.emit('queueStatus', {
                            status: 'inQueue'
                        });
                    }
                    return;
                }
                const gameId = this.gameService.createRemoteMultiplayerGame(player1, player2);
                this.gameService.addPlayerToGame(gameId, player2);
                socket1?.join(gameId);
                socket2?.join(gameId);
                this.gameGateway.server.to(gameId).emit('matchFound', {
                    gameId
                });
            }, duration * 1000);
        }
    }
    constructor(gameService){
        this.gameService = gameService;
        this.queue = [];
    }
};
QueueService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _gameservice.GameService === "undefined" ? Object : _gameservice.GameService
    ])
], QueueService);

//# sourceMappingURL=queue.service.js.map