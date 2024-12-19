import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/auth.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'chav',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'database',
      autoLoadModels: true,
      synchronize: true,
      models: [User],
    }),

    AuthModule,
  ],
})
export class AppModule {}
