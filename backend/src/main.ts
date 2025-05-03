import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const backendPort = configService.get('VITE_BACKEND_PORT');
  const frontendPort = configService.get('FRONTEND_PORT');

  if (!backendPort || !frontendPort) {
    logger.error('BACKEND_PORT and FRONTEND_PORT must be defined in .env');
    process.exit(1);
  }

  app.setGlobalPrefix('api'); //necesary?

  app.enableCors({
    origin: [
      `http://localhost:${frontendPort}`,
      `http://localhost:${backendPort}`,
      `http://127.0.0.1:${backendPort}`,
      `http://127.0.0.1:${frontendPort}`,
      `http://0.0.0.0:${frontendPort}`,
      `http://${process.env.VITE_HOSTNAME}:${frontendPort}`,
      `http://${process.env.VITE_HOSTNAME}:${backendPort}`,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  });

  await app.listen(backendPort ?? 3000, '0.0.0.0');
}
bootstrap();
