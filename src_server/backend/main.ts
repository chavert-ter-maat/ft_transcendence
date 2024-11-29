// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  require('dotenv').config();
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(5001);
}

bootstrap();

