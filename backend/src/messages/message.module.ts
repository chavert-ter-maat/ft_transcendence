// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Chat } from './message.model';
import { UserChat } from './userchat.model';
import { SequelizeModule } from '@nestjs/sequelize';
import * as dotenv from 'dotenv';
import { AuthModule } from 'src/auth/auth.module';
import { OnlineModule } from './online.module';

dotenv.config();

@Module({
	imports: [
		SequelizeModule.forFeature([Chat, UserChat ]),
		AuthModule,
		OnlineModule,
    ],
    providers: [MessageService],
    controllers: [MessageController],
})
export class MessageModule {}
