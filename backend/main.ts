// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); // Load environment variables
  const app = await NestFactory.create(AppModule);

  // Enable Cross-Origin Resource Sharing (CORS)
  app.enableCors({
    origin: 'http://localhost:3000', // Allow only frontend app to make requests
    methods: ['GET', 'POST'], // Allowed HTTP methods
    credentials: true, // Allow credentials (cookies, headers, etc.)
  });

  await app.listen(5001); // Start server on port 5001
}

bootstrap();
