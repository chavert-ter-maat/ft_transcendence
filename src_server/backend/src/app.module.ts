import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/auth.model';
import { Chat } from './messages/message.model';
import { UserChat } from './messages/userchat.model';
// import { MessageController } from './messages/message.controller';
// import { MessageService } from './messages/message.service';
// import { OnlineUsers } from './online_users';
import { MessageModule } from './messages/message.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			}),

		SequelizeModule.forRoot({
			dialect: 'postgres',
			host: process.env.DB_HOST,// || 'localhost',
			port: parseInt(process.env.DB_PORT || '5432'),
			username: process.env.DB_USERNAME, // || 'chav',
			password: process.env.DB_PASSWORD, // || 'password',
			database: process.env.DB_NAME, // || 'database',
			models: [User, Chat, UserChat],
			autoLoadModels: true,
			synchronize: true, // true in my main
			}),
		AuthModule,
		MessageModule,
		// SequelizeModule.forFeature([Chat, UserChat ]),
	],
	// providers: [OnlineUsers],
  	// controllers: [MessageController],
	// providers: [MessageService, OnlineUsers],
})
export class AppModule {}
