// src/auth/strategies/42.strategy.ts
import { Module } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-42';
import { ConfigModule } from '@nestjs/config';
// import * as dotenv from 'dotenv';

// dotenv.config();

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor() {
	// console.log("client ID: ",  process.env.CLIENT_UID_42);
    super({
      clientID: process.env.CLIENT_UID_42,
      clientSecret: process.env.CLIENT_SECRET_42,
      callbackURL: process.env.CALLBACK_URL_42,
      scope: ['public'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const user = {
      id: profile.id,
      username: profile.username,
      email: profile.emails[0].value,
      oauthToken: accessToken,
      oauthRefreshToken: refreshToken,
      provider: '42'
    };

    return user;
  }
}
