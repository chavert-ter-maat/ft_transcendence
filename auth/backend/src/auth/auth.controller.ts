// src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from './guards/42-auth.guards';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async usernamePasswordLogin(
    @Body() body: { username: string; password: string },
  ) {
    return this.authService.authenticate(body);
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard) // Apply the JwtAuthGuard here
  protectedRoute(@Req() req) {
    return { message: 'Access granted', user: req.user };
  }

  @Post('create')
  async createUser(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    return this.authService.createUser(username, password);
  }

  @Get(':username')
  async findUser(@Param('username') username: string) {
    return this.authService.findUserByName(username);
  }
}
