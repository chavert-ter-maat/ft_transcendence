import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users/user.model';
import { Chat } from './messages/message.model';
import { UserChat } from './messages/userchat.model';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { MessageController } from './messages/message.controller';
import { MessageService } from './messages/message.service';
import * as dotenv from 'dotenv';

dotenv.config();

// async connected_list and to_notify_list, if connected -> notify, if notify -> respond to long poll
// async dataracing? 

@Module({
	// ConfigModule.forRoot()
	imports: [
		SequelizeModule.forRoot({
		  dialect: 'postgres',
		  host: process.env.DB_HOST, //"172.18.0.2",//process.env.DB_HOST, // Use environment variable
		  port: +"5432",// Use 5432 as default if undefined
		  username: process.env.DB_USERNAME, // Use environment variable
		  password: process.env.DB_PASSWORD, // Use environment variable
		  database: process.env.DB_NAME, // Use environment variable
		  models: [User, Chat, UserChat ],
		  autoLoadModels: true,
		  synchronize: true,
		}),
		SequelizeModule.forFeature([User, Chat, UserChat ]),
	  ],
  controllers: [UsersController, MessageController],
  providers: [UsersService, MessageService],
})

export class AppModule {}
