import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { AuthService } from './auth.service';

@Injectable()
export class OAuth2Strategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly authService: AuthService) {
    super({
      authorizationURL: process.env.FORTYTWO_AUTHORIZE_URL,
      tokenURL: process.env.FORTYTWO_TOKEN_URL,
      clientID: process.env.FORTYTWO_CLIENT_ID,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
      callbackURL: process.env.FORTYTWO_REDIRECT_URI,
      passReqToCallback: true
    });
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any) {
    try {
      const userInfo = await this.authService.getUserInfo(accessToken);
      return {
        accessToken,
        refreshToken,
        ...userInfo
      };
    } catch (error) {
      throw new Error('Failed to validate user');
    }
  }
}