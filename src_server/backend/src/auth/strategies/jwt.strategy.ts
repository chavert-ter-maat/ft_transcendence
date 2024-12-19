import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
	const userId = parseInt(payload.userId, 10);
	
	if (isNaN(userId)) {
	  throw new Error('Invalid userId');
	}
  
	return {
	  userId, // Now this will be a number
	  username: payload.username
	};
  }
}
