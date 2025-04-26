// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Chat } from './message.model';
import { UserChat } from './userchat.model';
import { SequelizeModule } from '@nestjs/sequelize';
// import { UserChat } from './userchat.model'
// import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
// import { PassportModule } from '@nestjs/passport';
// import { FortyTwoStrategy } from '../auth/strategies/42.strategy'; // './strategies/42.strategy';
import { AuthModule } from 'src/auth/auth.module';
import { OnlineModule } from './online.module';

dotenv.config();

@Module({
	imports: [
		SequelizeModule.forFeature([Chat, UserChat ]),
		AuthModule,
		OnlineModule,
		// JwtModule.register({
		// 	global: true,
		// 	secret: process.env.JWT_SECRET,
		// 	signOptions: { expiresIn: '20d' },
		// }),
		// PassportModule,
    ],
    providers: [MessageService],
    controllers: [MessageController],
	  	// controllers: [MessageController],
	// providers: [MessageService, OnlineUsers],
})
export class MessageModule {}
