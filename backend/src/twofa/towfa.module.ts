import { Module } from '@nestjs/common';
import { TwoFAService } from './twofa.service';
import { TwoFAController } from './twofa.controller';
import { AuthService } from '../auth/auth.service';

@Module({
  providers: [TwoFAService, AuthService],
  controllers: [TwoFAController],
  exports: [TwoFAService]
})
export class TwoFAModule { }
