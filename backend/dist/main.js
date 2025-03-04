"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _core = require("@nestjs/core");
const _appmodule = require("./app.module");
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
async function bootstrap() {
    const logger = new _common.Logger('Bootstrap');
    const app = await _core.NestFactory.create(_appmodule.AppModule);
    app.useGlobalPipes(new _common.ValidationPipe());
    const configService = app.get(_config.ConfigService);
    const backendPort = configService.get('BACKEND_PORT');
    const frontendPort = configService.get('FRONTEND_PORT');
    if (!backendPort || !frontendPort) {
        logger.error('PORT and FRONT_PORT must be defined in .env');
        process.exit(1);
    }
    app.enableCors({
        origin: [
            `http://localhost:${frontendPort}`,
            `http://127.0.0.1:${frontendPort}`,
            `http://0.0.0.0:${frontendPort}`
        ],
        methods: [
            'GET',
            'POST',
            'PUT',
            'DELETE',
            'OPTIONS',
            'PATCH'
        ],
        credentials: true,
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept'
        ],
        exposedHeaders: [
            'Content-Range',
            'X-Content-Range'
        ]
    });
    await app.listen(backendPort ?? 3000);
}
bootstrap();

//# sourceMappingURL=main.js.map