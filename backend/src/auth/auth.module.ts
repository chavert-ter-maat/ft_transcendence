// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
// import * as dotenv from 'dotenv';
import { PassportModule } from '@nestjs/passport';
import { FortyTwoStrategy } from './strategies/42.strategy';

// dotenv.config();

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '20d' },
    }),
    PassportModule,
    ],
    providers: [AuthService, FortyTwoStrategy],
    controllers: [AuthController],
  })
export class AuthModule {}
