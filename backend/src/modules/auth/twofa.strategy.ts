import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class TwoFaStrategy extends PassportStrategy(Strategy, '2fa') {
	constructor(private authService: AuthService) {
		super();
	}

	// async validate(email: string, token: string): Promise<any> {
	// 	return this.authService.validateTwoFa(email, token);
	// }
}
