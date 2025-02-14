import { Module } from '@nestjs/common';
import { TwoFAService } from './twofa.service';
import { TwoFAProviders as TwoFAProviders } from './twofa.providers';

@Module({
  providers: [TwoFAService, ...TwoFAProviders],
  exports: [TwoFAService]
})
export class TwoFAModule { }
