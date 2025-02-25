import { Module } from '@nestjs/common';
import { TwoFAService } from './twofa.service';
import { TwoFAProviders } from './twofa.providers';
import { UsersModule } from '../users/users.module'
import { TwoFAController } from './twofa.controller';

@Module({
  imports: [UsersModule],
  providers: [TwoFAService, ...TwoFAProviders],
  controllers: [TwoFAController],
  exports: [TwoFAService]
})
export class TwoFAModule { }
