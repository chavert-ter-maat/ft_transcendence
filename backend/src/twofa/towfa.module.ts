import { Module } from '@nestjs/common';
import { TwoFAService } from './twofa.service';
import { TwoFAController } from './twofa.controller';

@Module({
  providers: [TwoFAService],
  controllers: [TwoFAController],
  exports: [TwoFAService]
})
export class TwoFAModule { }
