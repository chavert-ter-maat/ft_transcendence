import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'ftTranscendenceJWTSecretKey',
    });
  }

  async validate(payload: any) {
    const userId = parseInt(payload.userId, 10);

    if (isNaN(userId)) {
      throw new HttpException('Invalid userId', HttpStatus.BAD_REQUEST);
    }

    return {
      userId,
      username: payload.username
    };
  }
}
