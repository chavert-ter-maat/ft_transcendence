"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GameModule", {
    enumerable: true,
    get: function() {
        return GameModule;
    }
});
const _common = require("@nestjs/common");
const _gameservice = require("./game.service");
const _gamegateway = require("./game.gateway");
const _queuemodule = require("../queue/queue.module");
const _sequelize = require("@nestjs/sequelize");
const _matchentity = require("./entities/match.entity");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let GameModule = class GameModule {
};
GameModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            (0, _common.forwardRef)(()=>_queuemodule.QueueModule),
            _sequelize.SequelizeModule.forFeature([
                _matchentity.Match
            ])
        ],
        providers: [
            {
                provide: _gameservice.GameService,
                useClass: _gameservice.GameService
            },
            {
                provide: _gamegateway.GameGateway,
                useClass: _gamegateway.GameGateway
            }
        ],
        exports: [
            _gameservice.GameService,
            _gamegateway.GameGateway
        ]
    })
], GameModule);

//# sourceMappingURL=game.module.js.map