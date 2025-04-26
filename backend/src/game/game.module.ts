import { Module, forwardRef } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';
import { QueueModule } from './queue/queue.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Match } from './entities/match.entity';
import { User } from '../auth/auth.model';
import { MessageModule } from 'src/messages/message.module';
import { Chat } from 'src/messages/message.model';
import { OnlineModule } from 'src/messages/online.module';

@Module({
  imports: [
    forwardRef(() => QueueModule),
    SequelizeModule.forFeature([Match, User, Chat]),
	MessageModule,
	OnlineModule
  ],
  providers: [
    {
      provide: GameService,
      useClass: GameService,
    },
    {
      provide: GameGateway,
      useClass: GameGateway,
    },
    {
      provide: GameGateway,
      useClass: GameGateway,
    },
  ],
  controllers: [GameController],
  exports: [GameService, GameGateway],
})
export class GameModule {}
