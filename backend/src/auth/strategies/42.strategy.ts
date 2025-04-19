import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-42';
import { ConfigModule } from '@nestjs/config';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor() {
    console.log("client ID: ", process.env.CLIENT_UID_42);
    super({
      clientID: process.env.VITE_CLIENT_UID_42,
      clientSecret: process.env.CLIENT_SECRET_42,
      callbackURL: `http://${process.env.VITE_HOSTNAME || 'localhost'}:${process.env.VITE_BACKEND_PORT}/api/auth/42/callback`,
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
    };

    return user;
  }
}
