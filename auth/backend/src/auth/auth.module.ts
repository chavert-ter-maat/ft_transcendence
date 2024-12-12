// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FortyTwoController } from './42.controller'; // Import the FortyTwoController
// import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { PassportModule } from '@nestjs/passport';
import { PassportAuthController } from './passport-auth.controller';
// import { LocalStrategy } from './strategies/local.strategy';
import { FortyTwoStrategy } from './strategies/42.strategy'; // Import the FortyTwoStrategy

dotenv.config();

@Module({
  imports: [
    // UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET, // This should now properly load from .env
      signOptions: { expiresIn: '1d' },
    }),
    PassportModule,
  ],
  providers: [AuthService, FortyTwoStrategy], // Add FortyTwoStrategy here
  controllers: [AuthController, PassportAuthController, FortyTwoController], // Add FortyTwoController here
})
export class AuthModule {}
