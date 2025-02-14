import { Controller, Body, Post, Get, Delete, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/CreateUser.dto';
import { LoginUserDto } from '../users/dto/LoginUser.dto';
import { TwoFADto } from '../twofa/dto/TwoFA.dto';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) { }

	@UseGuards(AuthGuard('local'))
	@Post('login')
	async login(@Body(new ValidationPipe()) user: LoginUserDto) {
		return await this.authService.login(user);
	}

	@Post('signup')
	async signUp(@Body(new ValidationPipe()) user: CreateUserDto) {
		return await this.authService.create(user);
	}

	@Post('twofa/enable')
	async enableTwoFa(@Body(new ValidationPipe()) user: TwoFADto) {
		return this.authService.enableTwoFa(user);
	}

	@Post('twofa/disable')
	async disableTwoFa(@Body(new ValidationPipe()) user: TwoFADto) {
		return this.authService.disableTwoFa(user);
	}

	@Get('twofa/secret')
	async getTwoFaSecret(@Body(new ValidationPipe()) user: TwoFADto) {
		const secret = await this.authService.generateTwoFaSecret(user);
		return secret
	}

	@Delete('twofa/secret')
	async deleteTwoFaSecret(@Body(new ValidationPipe()) user: TwoFADto) {
		const secret = await this.authService.deleteTwoFaSecret(user);
		return secret
	}

	@Post('twofa/verify')
	async verifyTwoFa(@Body(new ValidationPipe()) user: TwoFADto) {
		return this.authService.verifyTwoFa(user);
	}
}
