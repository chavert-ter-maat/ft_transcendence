import { Controller, Body, Post, Get, Delete, UseGuards, Request, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/CreateUser.dto';
import { LoginUserDto } from '../users/dto/LoginUser.dto';

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
}
