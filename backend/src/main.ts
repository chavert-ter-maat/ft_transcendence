import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Sequelize } from 'sequelize-typescript';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add global prefix
  app.setGlobalPrefix('api');

  // Enable CORS with specific configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  const sequelize = app.get(Sequelize);
  await sequelize.sync();

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
