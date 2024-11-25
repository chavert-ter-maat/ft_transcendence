// users/users.module.ts

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.model';

@Module({
  imports: [SequelizeModule.forFeature([User])], // Registers the User model
  controllers: [UsersController], // Attaches the UsersController
  providers: [UsersService], // Attaches the UsersService
  exports: [UsersService], // Allows UsersService to be used in other modules
})
export class UsersModule {}
