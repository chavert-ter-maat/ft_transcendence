// src/auth/strategies/42.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor() {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env['42_CLIENT_ID'], // Adjusted to match your .env variable
      clientSecret: process.env['42_CLIENT_SECRET'], // Adjusted to match your .env variable
      callbackURL: process.env['42_CALLBACK_URL'], // Adjusted to match your .env variable
    });
  }

  async validate(accessToken: string, refreshToken: string): Promise<any> {
    try {
      const { data } = await axios.get('https://api.intra.42.fr/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return {
        id: data.id,
        username: data.login,
        email: data.email,
        oauthToken: accessToken,
        oauthRefreshToken: refreshToken,
        provider: '42',
      };
    } catch (error) {
      throw new Error('Error fetching user data from 42 API: ' + error.message);
    }
  }
}
