"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Match", {
    enumerable: true,
    get: function() {
        return Match;
    }
});
const _sequelizetypescript = require("sequelize-typescript");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let Match = class Match extends _sequelizetypescript.Model {
};
_ts_decorate([
    _sequelizetypescript.Column,
    _ts_metadata("design:type", String)
], Match.prototype, "player1Id", void 0);
_ts_decorate([
    _sequelizetypescript.Column,
    _ts_metadata("design:type", String)
], Match.prototype, "player2Id", void 0);
_ts_decorate([
    _sequelizetypescript.Column,
    _ts_metadata("design:type", Number)
], Match.prototype, "player1Score", void 0);
_ts_decorate([
    _sequelizetypescript.Column,
    _ts_metadata("design:type", Number)
], Match.prototype, "player2Score", void 0);
_ts_decorate([
    _sequelizetypescript.Column,
    _ts_metadata("design:type", String)
], Match.prototype, "gameMode", void 0);
_ts_decorate([
    _sequelizetypescript.Column,
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Match.prototype, "startTime", void 0);
_ts_decorate([
    _sequelizetypescript.Column,
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], Match.prototype, "endTime", void 0);
_ts_decorate([
    _sequelizetypescript.Column,
    _ts_metadata("design:type", String)
], Match.prototype, "winnerId", void 0);
Match = _ts_decorate([
    (0, _sequelizetypescript.Table)({
        tableName: 'match_history'
    })
], Match);

//# sourceMappingURL=match.entity.js.map