import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module'; // Replace with your actual auth module path
import { UserModule } from './users/user.module'; // Replace with your actual users module path
import { User } from './users/user.model'; // Import your User model
import { OauthToken } from './auth/oauth-token.model'; // Import OAuth Token model

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes environment variables available globally
    }),

    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'chav',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'database',
      autoLoadModels: true,
      synchronize: true, // Automatically sync models with the database
    }),

    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
