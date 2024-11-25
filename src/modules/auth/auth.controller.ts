import { Controller, Body, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserDto } from '../users/dto/user.dto';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@UseGuards(AuthGuard('local'))
	@Post('login')
	async login(@Request() req) {
		return await this.authService.login(req.user);
	}

	@Post('signup')
	async signUp(@Body() user: UserDto) {
		return await this.authService.create(user);
	}
	// @Post('twofa/enable')
	// async enableTwoFa(@Request() req) {
	// 	return this.authService.enableTwoFa(req.user.email);
	// }

	// @Post('twofa/disable')
	// async disableTwoFa(@Request() req) {
	// 	return this.authService.disableTwoFa(req.user.email);
	// }

	@Get('twofa/secret')
	async getTwoFaSecret(@Body() req: UserDto) {
		const secret = await this.authService.generateTwoFaSecret(req.email);
		return secret
	}

	@Post('twofa/verify')
	async verifyTwoFa(@Body() req) {
		return this.authService.verifyTwoFa(req.email, req.token);
	}

}
