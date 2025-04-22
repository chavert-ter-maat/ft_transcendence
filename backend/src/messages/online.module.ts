import { Module, forwardRef } from '@nestjs/common';
import { OnlineService } from './online.service';
import { MessageService } from './message.service';
import { OnlineUsers } from 'src/online_users';
import { MessageModule } from './message.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Chat } from 'src/messages/message.model';

@Module({
	imports: [
		forwardRef(() => MessageModule),
		SequelizeModule.forFeature([Chat]),
	],
	providers: [ OnlineService, MessageService, OnlineUsers ],
	exports: [ OnlineService ],
})
export class OnlineModule {}