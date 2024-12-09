import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.model';
import { OauthToken } from '../auth/oauth-token.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User, OauthToken])
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService, SequelizeModule]
})
export class UserModule {}