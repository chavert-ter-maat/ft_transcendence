// src/auth/strategies/42.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-42';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor() {
    super({
      clientID: process.env['42_CLIENT_ID'],
      clientSecret: process.env['42_CLIENT_SECRET'],
      callbackURL: process.env['42_CALLBACK_URL'],
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
      provider: '42',
      avatar: profile.photos ? profile.photos[0].value : null, // Default to null if no avatar
    };
    return user;
  }
}
