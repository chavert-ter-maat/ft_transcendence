import { Module } from '@nestjs/common';
import { Match } from './game/entities/match.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { QueueModule } from './queue/queue.module';
import { ConfigModule } from '@nestjs/config';
import { User } from './auth/auth.model';
import { Chat } from './messages/message.model';
import { UserChat } from './messages/userchat.model';
import { AuthModule } from './auth/auth.module';
import { MessageModule } from './messages/message.module';
import { TwoFAModule } from './twofa/towfa.module'

//unnecesary?
// import * as dotenv from 'dotenv';

// dotenv.config();
//

// console.log("client ID start fuck this pc: ",  process.env.CLIENT_ID);


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT as string) || 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [Match, User, Chat, UserChat],
      autoLoadModels: true,
      synchronize: true,
      logging: false,
    }),

    GameModule,
    QueueModule,
    AuthModule,
    MessageModule,
    TwoFAModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
