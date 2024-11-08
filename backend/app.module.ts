// src/app.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { User } from './users/user.model';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST, // Use environment variable
      port: 5432,
      // port: +process.env.DB_PORT,// Use 5432 as default if undefined
      username: process.env.DB_USERNAME, // Use environment variable
      password: process.env.DB_PASSWORD, // Use environment variable
      database: process.env.DB_NAME, // Use environment variable
      models: [User],
      autoLoadModels: true,
    }),
    SequelizeModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule {}
